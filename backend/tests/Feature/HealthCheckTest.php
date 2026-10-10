<?php

test('it returns api version and correlation id', function () {
    $response = $this->withHeader('X-Correlation-ID', 'test-correlation-123')
        ->getJson('/api/v1/version');

    $response->assertStatus(200)
        ->assertJson([
            'data' => [
                'name' => 'LearnHub',
                'api_version' => 'v1.0.0',
            ],
            'meta' => [
                'correlation_id' => 'test-correlation-123',
            ],
        ])
        ->assertHeader('X-Correlation-ID', 'test-correlation-123');
});

test('it formats 404 errors using the standard api-05 error envelope', function () {
    $response = $this->withHeader('X-Correlation-ID', 'test-err-correlation')
        ->getJson('/api/v1/non-existent-endpoint');

    $response->assertStatus(404)
        ->assertJson([
            'error' => [
                'code' => 'not_found',
                'message' => 'The requested resource was not found.',
                'details' => [],
                'correlation_id' => 'test-err-correlation',
            ],
        ]);
});

test('security headers are present in responses', function () {
    $response = $this->getJson('/api/v1/version');

    $response->assertHeader('X-Content-Type-Options', 'nosniff');
    $response->assertHeader('X-Frame-Options', 'DENY');
    $response->assertHeader('Strict-Transport-Security');
});
