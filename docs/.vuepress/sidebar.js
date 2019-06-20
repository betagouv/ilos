module.exports = {
  '/guide/': [
    'install',
    'action',
    'service',
    'infra',
    'directory_structure',
  ],
  '/foundation/': [
    'concepts',
    'architecture',
    'lifecycle',
  ],
  '/documentation/': [
    'handler',
    'service_provider',
    {
      title: 'Middlewares',
      path: '/documentation/middlewares/',
      children: [
        'middlewares/basics',
        'middlewares/acl',
        'middlewares/content_filter',
        'middlewares/custom',
      ]
    },
    {
      title: 'Transports',
      path: '/documentation/transports/',
      children: [
        'transports/basics',
        'transports/http',
        'transports/redis',
        'transports/custom',
      ]
    },
    {
      title: 'Providers',
      path: '/documentation/providers/basics',
      children: [
        'providers/basics',
        'providers/env',
        'providers/config',
        'providers/validator',
        'providers/repository',
        'providers/template',
        'providers/notification',
        'providers/custom',
      ]
    },
    'cli',
    'testing',
  ],
  '/about/': [
    'about',
    'contribute',
    'release_note',
  ],
}