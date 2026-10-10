<?php
$pdo = new PDO(
    'pgsql:host=ep-summer-rice-b5vr065y-pooler.c-7.us-east-2.aws.neon.tech;port=5432;dbname=neondb;sslmode=require',
    'neondb_owner',
    'npg_BPcGpoXZ02LN'
);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$statements = [
    'create table "users" ("id" bigserial not null primary key, "ulid" char(26) not null, "name" varchar(255) not null, "email" varchar(255) not null, "email_verified_at" timestamp(0) without time zone null, "password" varchar(255) not null, "avatar_url" varchar(255) null, "headline" varchar(255) null, "bio" text null, "locale" varchar(10) not null default \'en\', "timezone" varchar(50) not null default \'UTC\', "mfa_enabled" boolean not null default \'0\', "mfa_secret" text null, "mfa_recovery_codes" text null, "mfa_confirmed_at" timestamp(0) without time zone null, "failed_login_attempts" smallint not null default \'0\', "locked_until" timestamp(0) without time zone null, "terms_version" varchar(255) null, "terms_accepted_at" timestamp(0) without time zone null, "status" varchar(30) not null default \'active\', "deletion_requested_at" timestamp(0) without time zone null, "remember_token" varchar(100) null, "created_at" timestamp(0) without time zone null, "updated_at" timestamp(0) without time zone null, "deleted_at" timestamp(0) without time zone null)',
    'alter table "users" add constraint "users_ulid_unique" unique ("ulid")',
    'alter table "users" add constraint "users_email_unique" unique ("email")',
    'create index "users_status_index" on "users" ("status")',
];

$pdo->beginTransaction();
foreach ($statements as $i => $sql) {
    try {
        $pdo->exec($sql);
        echo "Statement $i OK: " . substr($sql, 0, 40) . "\n";
    } catch (Exception $e) {
        echo "FAILED on statement $i:\nSQL: $sql\nERROR: " . $e->getMessage() . "\n";
        break;
    }
}
$pdo->rollBack();
