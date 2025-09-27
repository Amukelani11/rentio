-- Smart Email Notification System
-- Tables to track user activity and prevent spam notifications

-- User activity log to track when users are online/active
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_duration INTERVAL DEFAULT '00:00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email notification log to track sent notifications and prevent spam
CREATE TABLE IF NOT EXISTS email_notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notification_type VARCHAR(50) DEFAULT 'MESSAGE_RECEIVED',
  email_subject TEXT,
  email_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, conversation_id, sent_at)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_last_seen ON user_activity_log(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_notification_log_user_conversation ON email_notification_log(user_id, conversation_id);
CREATE INDEX IF NOT EXISTS idx_email_notification_log_sent_at ON email_notification_log(sent_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_activity_log_updated_at
    BEFORE UPDATE ON user_activity_log
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update user activity (called when users interact with the app)
CREATE OR REPLACE FUNCTION update_user_activity(
  user_uuid UUID,
  activity_type TEXT DEFAULT 'GENERAL'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, last_seen_at, last_active_at)
  VALUES (user_uuid, NOW(), NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    last_seen_at = NOW(),
    last_active_at = NOW(),
    session_duration = EXTRACT(EPOCH FROM (NOW() - user_activity_log.created_at)) * INTERVAL '1 second';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user should receive notifications
CREATE OR REPLACE FUNCTION should_send_notification(
  user_uuid UUID,
  conversation_uuid UUID,
  check_hours INTEGER DEFAULT 3
) RETURNS BOOLEAN AS $$
DECLARE
  last_activity TIMESTAMP WITH TIME ZONE;
  last_notification TIMESTAMP WITH TIME ZONE;
  cutoff_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if user was active in the last check_hours
  SELECT last_seen_at INTO last_activity
  FROM user_activity_log
  WHERE user_id = user_uuid
  ORDER BY last_seen_at DESC
  LIMIT 1;

  -- Check if we sent a notification for this conversation in the last check_hours
  SELECT sent_at INTO last_notification
  FROM email_notification_log
  WHERE user_id = user_uuid AND conversation_id = conversation_uuid
  ORDER BY sent_at DESC
  LIMIT 1;

  cutoff_time := NOW() - (check_hours || ' hours')::INTERVAL;

  -- Don't send if user was active recently
  IF last_activity IS NOT NULL AND last_activity > cutoff_time THEN
    RETURN FALSE;
  END IF;

  -- Don't send if we sent a notification recently for this conversation
  IF last_notification IS NOT NULL AND last_notification > cutoff_time THEN
    RETURN FALSE;
  END IF;

  -- Send notification
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE user_activity_log IS 'Tracks user activity to determine if they are online/active for smart email notifications';
COMMENT ON TABLE email_notification_log IS 'Tracks sent email notifications to prevent spam and implement cooldown periods';
COMMENT ON FUNCTION update_user_activity IS 'Updates user activity timestamp when users interact with the app';
COMMENT ON FUNCTION should_send_notification IS 'Determines if a user should receive an email notification based on activity and cooldown periods';





