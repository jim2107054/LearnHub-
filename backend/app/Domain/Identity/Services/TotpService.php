<?php

declare(strict_types=1);

namespace App\Domain\Identity\Services;

use Illuminate\Support\Str;

class TotpService
{
    private const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    /**
     * Generate a cryptographically secure Base32 secret for TOTP.
     */
    public function generateSecret(int $length = 16): string
    {
        $secret = '';
        $charsCount = strlen(self::BASE32_CHARS);

        for ($i = 0; $i < $length; $i++) {
            $secret .= self::BASE32_CHARS[random_int(0, $charsCount - 1)];
        }

        return $secret;
    }

    /**
     * Generate an array of 8 recovery codes.
     *
     * @return array<int, string>
     */
    public function generateRecoveryCodes(int $count = 8): array
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $codes[] = strtoupper(Str::random(4).'-'.Str::random(4));
        }

        return $codes;
    }

    /**
     * Verify a 6-digit TOTP code against a Base32 secret with 1-step window tolerance.
     */
    public function verifyCode(string $secret, string $code, int $window = 1): bool
    {
        $code = trim($code);
        if (strlen($code) !== 6 || ! ctype_digit($code)) {
            return false;
        }

        $timeSlice = (int) floor(time() / 30);

        for ($i = -$window; $i <= $window; $i++) {
            if ($this->calculateCode($secret, $timeSlice + $i) === $code) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate otpauth:// URI for QR code generation.
     */
    public function getQrCodeUrl(string $company, string $email, string $secret): string
    {
        return sprintf(
            'otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30',
            rawurlencode($company),
            rawurlencode($email),
            $secret,
            rawurlencode($company)
        );
    }

    private function calculateCode(string $secret, int $timeSlice): string
    {
        $secretBinary = $this->base32Decode($secret);
        $timeBinary = pack('N*', 0).pack('N*', $timeSlice);

        $hash = hash_hmac('sha1', $timeBinary, $secretBinary, true);
        $offset = ord(substr($hash, -1)) & 0x0F;

        $truncatedHash = (
            ((ord($hash[$offset]) & 0x7F) << 24) |
            ((ord($hash[$offset + 1]) & 0xFF) << 16) |
            ((ord($hash[$offset + 2]) & 0xFF) << 8) |
            (ord($hash[$offset + 3]) & 0xFF)
        );

        $code = $truncatedHash % 1000000;

        return str_pad((string) $code, 6, '0', STR_PAD_LEFT);
    }

    private function base32Decode(string $b32): string
    {
        $b32 = strtoupper(rtrim($b32, '='));
        $binary = '';

        for ($i = 0; $i < strlen($b32); $i++) {
            $val = strpos(self::BASE32_CHARS, $b32[$i]);
            if ($val === false) {
                continue;
            }
            $binary .= str_pad(decbin($val), 5, '0', STR_PAD_LEFT);
        }

        $result = '';
        for ($i = 0; $i < strlen($binary) - 7; $i += 8) {
            $result .= chr((int) bindec(substr($binary, $i, 8)));
        }

        return $result;
    }
}
