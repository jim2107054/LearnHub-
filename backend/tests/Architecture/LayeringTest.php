<?php

test('domain models strictly use ulids or proper primary keys')
    ->expect('App\Domain')
    ->toUseStrictTypes();

test('infrastructure code uses strict types')
    ->expect('App\Infrastructure')
    ->toUseStrictTypes();

test('no debugging functions left in app codebase')
    ->expect(['dd', 'dump', 'ray', 'var_dump'])
    ->not->toBeUsed();
