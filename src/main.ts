import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { RolesService } from './modules/roles/roles.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const defaultOrigins =
    process.env.FRONTEND_ORIGIN ??
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,https://task-flow-maria.onrender.com,https://api.taskflowpro.com';

  const frontendOrigins = defaultOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: frontendOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  // ══════════════════════════════════════════════════════════════
  // Inicializar roles base en BD (ADMIN, GERENTE, DESARROLLADOR)
  // ══════════════════════════════════════════════════════════════
  const rolesService = app.get(RolesService);
  await rolesService.inicializarRoles();
  console.log('✅ Roles base inicializados (ADMIN, GERENTE, DESARROLLADOR)');

  // ══════════════════════════════════════════════════════════════
  // CONFIGURACIÓN SWAGGER
  // ══════════════════════════════════════════════════════════════
  const swaggerConfigBuilder = new DocumentBuilder()
    .setTitle('🚀 TaskFlow Pro API')
    .setDescription(
      'API completa para gestión de tareas y proyectos con autenticación segura.\n\n' +
        '## Características\n' +
        '- ✅ Autenticación con JWT\n' +
        '- ✅ Roles como módulo independiente en BD (ADMIN, GERENTE, DESARROLLADOR)\n' +
        '- ✅ Gestión completa de usuarios\n' +
        '- ✅ Gestión de proyectos\n' +
        '- ✅ Validación de datos con class-validator\n' +
        '- ✅ Documentación automática interactiva\n\n' +
        '## Guía de Prueba en Swagger\n' +
        '### Paso 1 — Obtener lista de roles\n' +
        '1. Registrarse: `POST /auth/registro` (se asigna rol DESARROLLADOR)\n' +
        '2. Login: `POST /auth/login` → copiar el `accessToken`\n' +
        '3. Autorizar: botón **Authorize** → pegar el token\n' +
        '4. `GET /roles` → copiar el `id` del rol deseado (ADMIN, GERENTE o DESARROLLADOR)\n\n' +
        '### Paso 2 — Flujo de usuarios\n' +
        '5. `POST /users` (ADMIN) → crear usuario con `rolId` opcional\n' +
        '6. `PATCH /users/:id/rol` (ADMIN) → asignar rol con el `rolId` obtenido en paso 4\n' +
        '7. `GET /users` (ADMIN / GERENTE) → listar todos los usuarios\n' +
        '8. `GET /users/perfil` → ver tu propio perfil (cualquier rol)\n' +
        '9. `GET /users/:id` (ADMIN / GERENTE) → ver usuario por ID\n\n' +
        '## Roles y Permisos\n' +
        '| Endpoint | ADMIN | GERENTE | DESARROLLADOR |\n' +
        '|---|:---:|:---:|:---:|\n' +
        '| `POST /users` | ✅ | ❌ | ❌ |\n' +
        '| `GET /users` | ✅ | ✅ | ❌ |\n' +
        '| `GET /users/perfil` | ✅ | ✅ | ✅ |\n' +
        '| `GET /users/:id` | ✅ | ✅ | ❌ |\n' +
        '| `PATCH /users/:id/rol` | ✅ | ❌ | ❌ |\n' +
        '| `PATCH /users/:id` | ✅ | ❌ | ❌ |\n' +
        '| `DELETE /users/:id` | ✅ | ❌ | ❌ |\n' +
        '| `GET /roles` | ✅ | ✅ | ✅ |\n',
    )
    .setVersion('1.0.0')
    .setContact(
      'Task Flow Pro',
      'https://example.com',
      'support@taskflowpro.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa el JWT token obtenido en `POST /auth/login`',
      },
      'Bearer',
    );

  const swaggerServerUrl =
    process.env.SWAGGER_SERVER_URL ?? 'https://task-flow-maria.onrender.com';
  const swaggerConfig = swaggerConfigBuilder
    .addServer(
      process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : swaggerServerUrl,
      process.env.NODE_ENV === 'development' ? 'Desarrollo' : 'Producción',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
    },
    customCss: `
      .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .model-box { padding: 15px; }
    `,
    customCssUrl: [
      'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3/themes/3.52.0/theme-material.css',
    ],
  });

  const requestedPort = Number(process.env.PORT ?? 3000);

  async function tryListen(startPort: number, maxAttempts = 10) {
    let port = startPort;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        await app.listen(port);
        return port;
      } catch (err: any) {
        if (err && err.code === 'EADDRINUSE') {
          console.warn(`Puerto ${port} en uso, intentando ${port + 1}...`);
          port++;
          continue;
        }
        throw err;
      }
    }
    throw new Error(`No se pudo asignar puerto tras ${maxAttempts} intentos.`);
  }

  const boundPort = await tryListen(requestedPort);

  console.log(`\n✅ Servidor ejecutándose en: http://localhost:${boundPort}`);
  console.log(`📚 Swagger disponible en:    http://localhost:${boundPort}/docs\n`);
}
bootstrap();
