-- Drop existing tables in the correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS public.recommendations CASCADE;
DROP TABLE IF EXISTS public.spending_data CASCADE;
DROP TABLE IF EXISTS public.credit_cards CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.spending_analyses CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.user_recommendations CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
-- DROP TRIGGER IF EXISTS update_users_updated_at ON users;
-- DROP TRIGGER IF EXISTS update_credit_cards_updated_at ON credit_cards;
-- DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences; 