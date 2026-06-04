import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbPort = Number(configService.get<string>('DB_PORT') ?? 3306);
        const dbUsername =
          configService.get<string>('DB_USERNAME') ??
          configService.getOrThrow<string>('DB_USER');
        const dbDatabase =
          configService.get<string>('DB_DATABASE') ??
          configService.getOrThrow<string>('DB_NAME');
        const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
        const dbSsl = configService.get<string>('DB_SSL') === 'true';
        const dbSslRejectUnauthorized =
          configService.get<string>('DB_SSL_REJECT_UNAUTHORIZED') === 'true';
        const dbSynchronize =
          configService.get<string>('DB_SYNCHRONIZE') ??
          String(nodeEnv === 'development');

        let sslConfig: any = undefined;
        if (dbSsl) {
          sslConfig = {
            rejectUnauthorized: dbSslRejectUnauthorized,
          };
          
          // Intenta cargar el certificado CA si existe
          const caCertPath = path.join(process.cwd(), 'certs', 'ca.pem');
          if (fs.existsSync(caCertPath)) {
            console.log('🔐 Cargando certificado CA desde:', caCertPath);
            sslConfig.ca = [fs.readFileSync(caCertPath, 'utf8')];
          } else {
            console.warn('⚠️ Certificado CA no encontrado en:', caCertPath);
          }
        }

        console.log('🗄️ Conectando a BD:', {
          host: configService.get<string>('DB_HOST'),
          port: dbPort,
          database: dbDatabase,
          username: dbUsername,
          ssl: dbSsl,
        });

        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST') ?? 'localhost',
          port: Number.isNaN(dbPort) ? 3306 : dbPort,
          username: dbUsername,
          password: configService.getOrThrow<string>('DB_PASSWORD'),
          database: dbDatabase,
          autoLoadEntities: true,
          synchronize: dbSynchronize === 'true',
          logging: nodeEnv === 'development',
          ssl: dbSsl ? sslConfig : false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
