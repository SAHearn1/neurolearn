-- Migration 026: Auto-increment lessons_completed and streak_days on lesson completion
-- Trigger fires after INSERT or UPDATE on lesson_progress when status becomes 'completed'

CREATE OR REPLACE FUNCTION public.handle_lesson_completed()
RETURNS trigger AS $$
DECLARE
  last_completed_date date;
  current_streak integer;
BEGIN
  -- Only fire when status is newly 'completed'
  IF NEW.status <> 'completed' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Increment lessons_completed
  UPDATE profiles
    SET lessons_completed = lessons_completed + 1,
        updated_at = now()
    WHERE user_id = NEW.user_id;

  -- Update streak: check if the previous completed lesson was yesterday
  SELECT (completed_at AT TIME ZONE 'UTC')::date INTO last_completed_date
    FROM lesson_progress
    WHERE user_id = NEW.user_id
      AND status = 'completed'
      AND id <> NEW.id
    ORDER BY completed_at DESC
    LIMIT 1;

  SELECT streak_days INTO current_streak FROM profiles WHERE user_id = NEW.user_id;

  IF last_completed_date IS NOT NULL AND last_completed_date = (CURRENT_DATE - INTERVAL '1 day')::date THEN
    -- Continuing streak
    UPDATE profiles SET streak_days = current_streak + 1, updated_at = now() WHERE user_id = NEW.user_id;
  ELSIF last_completed_date IS NULL OR last_completed_date < (CURRENT_DATE - INTERVAL '1 day')::date THEN
    -- Reset streak to 1
    UPDATE profiles SET streak_days = 1, updated_at = now() WHERE user_id = NEW.user_id;
  END IF;
  -- If completed same day, streak stays the same

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_lesson_completed ON lesson_progress;
CREATE TRIGGER on_lesson_completed
  AFTER INSERT OR UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_lesson_completed();
