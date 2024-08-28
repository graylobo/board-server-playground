import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommentsModule } from 'src/comments/comments.module';
import OrmConfigProvider from 'src/config/orm-config.provider';
import { PostsModule } from 'src/posts/posts.module';
import { UsersModule } from 'src/users/users.module';

console.log(process.env.NODE_ENV);
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => OrmConfigProvider.forRoot(),
    }),
    PostsModule,
    CommentsModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
