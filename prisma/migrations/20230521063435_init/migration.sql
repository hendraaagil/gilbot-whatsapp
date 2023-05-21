-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "name" TEXT,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commands" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "minute_limit" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "current_commands" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "command_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "current_commands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "last_used_commands" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "command_id" INTEGER NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "last_used_commands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_messages" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT,
    "device_type" TEXT,
    "has_media" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_number_key" ON "users"("number");

-- CreateIndex
CREATE UNIQUE INDEX "users_chat_id_key" ON "users"("chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "commands_name_key" ON "commands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "current_commands_user_id_key" ON "current_commands"("user_id");

-- AddForeignKey
ALTER TABLE "current_commands" ADD CONSTRAINT "current_commands_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "current_commands" ADD CONSTRAINT "current_commands_command_id_fkey" FOREIGN KEY ("command_id") REFERENCES "commands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "last_used_commands" ADD CONSTRAINT "last_used_commands_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "last_used_commands" ADD CONSTRAINT "last_used_commands_command_id_fkey" FOREIGN KEY ("command_id") REFERENCES "commands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
