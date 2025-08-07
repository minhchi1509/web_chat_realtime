-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NOT NULL,
    `is_enable_two_factor_auth` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `user_email_key`(`email`),
    INDEX `user_full_name_idx`(`full_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversation` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `thumbnail` VARCHAR(191) NULL,
    `is_group_chat` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `conversation_is_group_chat_idx`(`is_group_chat`),
    INDEX `conversation_updated_at_idx`(`updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message` (
    `id` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_last_message_of_conversation` BOOLEAN NOT NULL DEFAULT true,
    `is_show_seperate_time` BOOLEAN NOT NULL DEFAULT false,
    `conversation_id` VARCHAR(191) NOT NULL,
    `sender_id` VARCHAR(191) NOT NULL,

    INDEX `message_conversation_id_idx`(`conversation_id`),
    INDEX `message_is_last_message_of_conversation_idx`(`is_last_message_of_conversation`),
    INDEX `message_created_at_idx`(`created_at`),
    INDEX `message_conversation_id_created_at_idx`(`conversation_id`, `created_at`),
    INDEX `message_conversation_id_is_last_message_of_conversation_idx`(`conversation_id`, `is_last_message_of_conversation`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversation_participant` (
    `id` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_seen_message_at` DATETIME(3) NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `conversation_id` VARCHAR(191) NOT NULL,
    `last_seen_message_id` VARCHAR(191) NULL,

    INDEX `conversation_participant_user_id_idx`(`user_id`),
    INDEX `conversation_participant_conversation_id_idx`(`conversation_id`),
    INDEX `conversation_participant_last_seen_message_id_idx`(`last_seen_message_id`),
    UNIQUE INDEX `conversation_participant_user_id_conversation_id_key`(`user_id`, `conversation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_media` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `type` ENUM('PHOTO', 'VIDEO', 'AUDIO', 'FILE') NOT NULL,
    `file_name` VARCHAR(191) NULL,
    `message_id` VARCHAR(191) NOT NULL,

    INDEX `message_media_message_id_idx`(`message_id`),
    INDEX `message_media_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_emotion` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('LIKE', 'LOVE', 'WOW', 'HAHA', 'SAD', 'ANGRY') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `message_id` VARCHAR(191) NOT NULL,
    `participant_id` VARCHAR(191) NOT NULL,

    INDEX `message_emotion_message_id_idx`(`message_id`),
    INDEX `message_emotion_participant_id_idx`(`participant_id`),
    INDEX `message_emotion_type_idx`(`type`),
    UNIQUE INDEX `message_emotion_message_id_participant_id_key`(`message_id`, `participant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversation`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `conversation_participant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_participant` ADD CONSTRAINT `conversation_participant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_participant` ADD CONSTRAINT `conversation_participant_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_participant` ADD CONSTRAINT `conversation_participant_last_seen_message_id_fkey` FOREIGN KEY (`last_seen_message_id`) REFERENCES `message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_media` ADD CONSTRAINT `message_media_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `message`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_emotion` ADD CONSTRAINT `message_emotion_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `message`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_emotion` ADD CONSTRAINT `message_emotion_participant_id_fkey` FOREIGN KEY (`participant_id`) REFERENCES `conversation_participant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
