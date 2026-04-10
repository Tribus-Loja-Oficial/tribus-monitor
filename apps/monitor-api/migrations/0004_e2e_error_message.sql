-- Add error_message column to e2e_results for storing the first line of test failure output
ALTER TABLE e2e_results ADD COLUMN error_message TEXT;
