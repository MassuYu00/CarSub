import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
    apiVersion: "2025-11-17.clover" as any, // Cast to any to avoid strict type checking if types are mismatched
})

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { priceId } = await req.json()

        if (!priceId) {
            return new NextResponse("Price ID is required", { status: 400 })
        }

        // Get user profile to check for existing Stripe Customer ID
        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id, email, full_name")
            .eq("id", user.id)
            .single()

        let customerId = profile?.stripe_customer_id

        if (!customerId) {
            // Create new Stripe Customer
            const customer = await stripe.customers.create({
                email: user.email || profile?.email,
                name: profile?.full_name ? decodeURIComponent(atob(profile.full_name)) : undefined,
                metadata: {
                    supabaseUUID: user.id,
                },
            })
            customerId = customer.id

            // Save Stripe Customer ID to profile
            await supabase
                .from("profiles")
                .update({ stripe_customer_id: customerId })
                .eq("id", user.id)
        }

        // Create Subscription
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: "default_incomplete",
            payment_settings: { save_default_payment_method: "on_subscription" },
            expand: ["latest_invoice.payment_intent"],
        })

        const latestInvoice = subscription.latest_invoice as any

        if (
            !latestInvoice ||
            typeof latestInvoice === "string" ||
            !latestInvoice.payment_intent ||
            typeof latestInvoice.payment_intent === "string"
        ) {
            throw new Error("Failed to create subscription payment intent")
        }

        const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent

        return NextResponse.json({
            subscriptionId: subscription.id,
            clientSecret: paymentIntent.client_secret,
        })
    } catch (error) {
        console.error("[SUBSCRIPTION_ERROR]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
