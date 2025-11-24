-- Add foreign key constraints for proper table relationships

-- reservations.user_id -> profiles.id
ALTER TABLE reservations
DROP CONSTRAINT IF EXISTS reservations_user_id_fkey;

ALTER TABLE reservations
ADD CONSTRAINT reservations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- reservations.vehicle_id -> vehicles.id
ALTER TABLE reservations
DROP CONSTRAINT IF EXISTS reservations_vehicle_id_fkey;

ALTER TABLE reservations
ADD CONSTRAINT reservations_vehicle_id_fkey 
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

-- user_subscriptions.user_id -> profiles.id
ALTER TABLE user_subscriptions
DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_fkey;

ALTER TABLE user_subscriptions
ADD CONSTRAINT user_subscriptions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- user_subscriptions.plan_id -> subscription_plans.id
ALTER TABLE user_subscriptions
DROP CONSTRAINT IF EXISTS user_subscriptions_plan_id_fkey;

ALTER TABLE user_subscriptions
ADD CONSTRAINT user_subscriptions_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE;
