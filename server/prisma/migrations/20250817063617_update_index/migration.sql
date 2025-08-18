-- CreateIndex
CREATE INDEX `conversation_participant_user_id_left_at_idx` ON `conversation_participant`(`user_id`, `left_at`);
