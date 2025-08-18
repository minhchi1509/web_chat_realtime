-- DropForeignKey
ALTER TABLE `conversation_participant` DROP FOREIGN KEY `conversation_participant_conversation_id_fkey`;

-- DropForeignKey
ALTER TABLE `conversation_participant` DROP FOREIGN KEY `conversation_participant_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `message_conversation_id_fkey`;

-- DropForeignKey
ALTER TABLE `system_action_detail` DROP FOREIGN KEY `system_action_detail_actor_id_fkey`;

-- DropIndex
DROP INDEX `system_action_detail_actor_id_fkey` ON `system_action_detail`;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversation`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `conversation_participant` ADD CONSTRAINT `conversation_participant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_participant` ADD CONSTRAINT `conversation_participant_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_action_detail` ADD CONSTRAINT `system_action_detail_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `conversation_participant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
