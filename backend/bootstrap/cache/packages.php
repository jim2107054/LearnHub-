<?php return array (
  'barryvdh/laravel-dompdf' => 
  array (
    'aliases' => 
    array (
      'PDF' => 'Barryvdh\\DomPDF\\Facade\\Pdf',
      'Pdf' => 'Barryvdh\\DomPDF\\Facade\\Pdf',
    ),
    'providers' => 
    array (
      0 => 'Barryvdh\\DomPDF\\ServiceProvider',
    ),
  ),
  'dedoc/scramble' => 
  array (
    'providers' => 
    array (
      0 => 'Dedoc\\Scramble\\ScrambleServiceProvider',
    ),
  ),
  'laravel/horizon' => 
  array (
    'aliases' => 
    array (
      'Horizon' => 'Laravel\\Horizon\\Horizon',
    ),
    'providers' => 
    array (
      0 => 'Laravel\\Horizon\\HorizonServiceProvider',
    ),
  ),
  'laravel/sanctum' => 
  array (
    'providers' => 
    array (
      0 => 'Laravel\\Sanctum\\SanctumServiceProvider',
    ),
  ),
  'laravel/scout' => 
  array (
    'providers' => 
    array (
      0 => 'Laravel\\Scout\\ScoutServiceProvider',
    ),
  ),
  'laravel/sentinel' => 
  array (
    'providers' => 
    array (
      0 => 'Laravel\\Sentinel\\SentinelServiceProvider',
    ),
  ),
  'laravel/socialite' => 
  array (
    'aliases' => 
    array (
      'Socialite' => 'Laravel\\Socialite\\Facades\\Socialite',
    ),
    'providers' => 
    array (
      0 => 'Laravel\\Socialite\\SocialiteServiceProvider',
    ),
  ),
  'laravel/telescope' => 
  array (
    'providers' => 
    array (
      0 => 'Laravel\\Telescope\\TelescopeServiceProvider',
    ),
  ),
  'nesbot/carbon' => 
  array (
    'providers' => 
    array (
      0 => 'Carbon\\Laravel\\ServiceProvider',
    ),
  ),
  'nunomaduro/collision' => 
  array (
    'providers' => 
    array (
      0 => 'NunoMaduro\\Collision\\Adapters\\Laravel\\CollisionServiceProvider',
    ),
  ),
  'nunomaduro/termwind' => 
  array (
    'providers' => 
    array (
      0 => 'Termwind\\Laravel\\TermwindServiceProvider',
    ),
  ),
  'pestphp/pest-plugin-laravel' => 
  array (
    'providers' => 
    array (
      0 => 'Pest\\Laravel\\PestServiceProvider',
    ),
  ),
  'sentry/sentry-laravel' => 
  array (
    'aliases' => 
    array (
      'Sentry' => 'Sentry\\Laravel\\Facade',
    ),
    'providers' => 
    array (
      0 => 'Sentry\\Laravel\\ServiceProvider',
      1 => 'Sentry\\Laravel\\Tracing\\ServiceProvider',
    ),
  ),
  'spatie/laravel-permission' => 
  array (
    'providers' => 
    array (
      0 => 'Spatie\\Permission\\PermissionServiceProvider',
    ),
  ),
  'spatie/laravel-query-builder' => 
  array (
    'providers' => 
    array (
      0 => 'Spatie\\QueryBuilder\\QueryBuilderServiceProvider',
    ),
  ),
);