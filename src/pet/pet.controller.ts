import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import * as Joi from 'joi';
import Knex from 'knex';
import { NestjsKnexService } from 'nestjs-knexjs';

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from 'src/auth.guard';
import * as moment from 'moment';
import * as jwt from 'jwt-simple';

enum PetCategory {
  DOG = 'dog',
  CAT = 'cat',
}

const SEPER_SECRE_KEY = 'clave super secreta';

const schema = Joi.object({
  name: Joi.string().required(),
  last_name: Joi.string().required(),
  password: Joi.string()
    .pattern(
      new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'),
    )
    .required(),
  email: Joi.string().required(),
});

const schemaLogin = Joi.object({
  password: Joi.string()
    .pattern(
      new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'),
    )
    .required(),
  email: Joi.string().required(),
});

@Controller('pet')
export class PetController {
  /* simula una bd relacional */

  /* Entidad pets */
  pets: any = [
    {
      id: 1,
      name: 'Kira',
      /* en este caso category es una clave foránea a la entidad categoria */
      category: 1,
    },
    {
      id: 2,
      name: 'Maison Mount',
      category: 2,
    },
    {
      id: 3,
      name: 'Rex',
      category: 1,
    },
    {
      id: 4,
      name: 'Machi',
      category: 2,
    },
    {
      id: 5,
      name: 'Rin tin tin',
      category: 1,
    },
    {
      id: 6,
      name: 'Toby',
      category: 1,
    },
  ];

  /* Entidad categorias */
  categories = [
    {
      id: 1,
      name: PetCategory.DOG,
    },
    {
      id: 2,
      name: PetCategory.CAT,
    },
  ];

  private readonly knex: Knex = null;

  /* esto simula una bd no relacional, como Mongo */
  noRelationalPets = [
    {
      id: 1,
      name: 'Kira',
      category: {
        id: 1,
        name: PetCategory.DOG,
      },
    },
    {
      id: 2,
      name: 'Maison Mount',
      category: {
        id: 2,
        name: 'Maison Mount',
        category: PetCategory.CAT,
      },
    },
  ];

  constructor(
    private nestjsKnexService: NestjsKnexService,
    private httpService: HttpService,
  ) {
    this.knex = this.nestjsKnexService.getKnexConnection();
  }

  @Post()
  public post(@Body() body: any, @Res() response: Response) {
    try {
      //throw new Error();
      //Logger.log(body);
      const result = schema.validate(body);
      console.log(body);
      Logger.log({ result });
      if (result.error) {
        return response.status(HttpStatus.BAD_REQUEST).send({
          error: 'Invalid request body',
        });
      }

      const category = this.categories.find((cat) => cat.id === body.category);
      Logger.debug(category);
      if (!category) {
        return response.status(HttpStatus.NOT_FOUND).send({
          error: 'Category not found',
        });
      }
      const newPet = {
        name: body.name,
        id: this.pets.length + 1,
        category,
      };
      this.pets.push(newPet);
      return response.status(HttpStatus.CREATED).send(newPet);
    } catch (ex) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: 'Server error' });
    }
  }

  /*@Get()
  public get(@Query() query: any, @Res() response: Response) {
    Logger.log(query);
    return response.status(HttpStatus.OK).send({
      nombre: 'get',
      query,
    });
  }*/

  @Delete(':id')
  public async delete(@Res() response: Response, @Param() params) {
    console.log(params.id);
    try {
      const data = await this.knex('test').del().where({ id: params.id });
      return response.sendStatus(HttpStatus.OK).send(data);
    } catch (ex) {
      console.log(ex);
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: 'Server error' });
    }
  }

  @Get()
  @UseGuards(new AuthGuard())
  public async get(@Res() response: Response) {
    //const data = await this.knex('test').select('*');
    const data = this.pets;
    //Logger.log({ data, pets });
    return response.status(HttpStatus.OK).send(data);
  }

  @Get('axios')
  public async getTask(@Res() response: Response) {
    //const data = await this.knex('test').select('*');
    const requestPets = await axios.get('https://bsl1.herokuapp.com/pet');
    const pets = requestPets.data.pets;
    const requestCategories = await axios.get(
      'https://bsl1.herokuapp.com/pet/categories',
    );
    const categorias = requestCategories.data.categories;
    const petsWithCatName = pets.map((pet) => {
      delete pet.id;
      pet.category = categorias.find(
        (category) => category.id === pet.category,
      ).name;
      return pet;
    });
    //Logger.log({ data });
    return response.status(HttpStatus.OK).send({ petsWithCatName });
  }

  @Post('login')
  public async login(@Res() response: Response, @Body() body: any) {
    try {
      console.log(body);
      const result = schemaLogin.validate(body);
      if (result.error) {
        return response.status(HttpStatus.BAD_REQUEST).send({
          error: result.error,
        });
      }
      const queryResult = await this.knex('test').where({ email: body.email });
      /*const queryResult = await this.knex('test').where({
        last_name: 'Doming',
      });*/
      console.log(queryResult);
      if (!queryResult.length) {
        return response.status(HttpStatus.BAD_REQUEST).send({
          error: 'email or password invalid',
        });
      }
      const user = queryResult[0];

      const isValidPassword = bcrypt.compareSync(body.password, user.password);
      if (!isValidPassword) {
        return response.status(HttpStatus.BAD_REQUEST).send({
          error: 'email or password invalid',
        });
      }

      const token = this.createToken(user);
      user.token = token;
      const queryLastConnection = await this.knex('connection').where({
        user_id: user.id,
      });
      console.log({ queryLastConnection });
      user.lastConnection = !queryLastConnection.length
        ? 'Hola por primera vez'
        : queryLastConnection[0].last_connection;

      const newConnection = {
        user_id: user.id,
        last_connection: 'hoy',
      };
      const updateResult = await this.knex('connection')
        .update(newConnection)
        .where({
          user_id: user.id,
        });
      console.log({ updateResult });

      //console.log(user);
      delete user.password;

      return response.status(HttpStatus.OK).send({
        user,
      });
    } catch (ex) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: ex.message });
    }
  }

  private createToken(user) {
    const payload = {
      email: user.email,
      mensajePlay: 'holi',
      sub: user.id,
      iat: moment().unix(),
      exp: moment().add(30, 'second').unix(),
    };
    return jwt.encode(payload, SEPER_SECRE_KEY);
  }

  @Post('axios')
  public async postAxios(@Res() response: Response, @Body() body: any) {
    try {
      const result = schema.validate(body);
      /*const strongRegex = new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
      );
      console.log(strongRegex.test(body.password));*/
      if (result.error) {
        return response.status(HttpStatus.BAD_REQUEST).send({
          error: result.error,
        });
      }

      const password = body.password;
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const id = uuidv4();
      const data = {
        id,
        last_name: body.last_name,
        name: body.name,
        password: hashedPassword,
        email: body.email,
      };

      console.log(data);

      await this.knex('test').insert(data);
      //Logger.log(data);
      return response.status(HttpStatus.CREATED).send({ data });
    } catch (ex) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: ex.message });
    }
  }

  @Get('categories')
  public getCategories(@Res() response: Response) {
    return response.status(HttpStatus.OK).send({ categories: this.categories });
  }

  /*@Get()
  public get(@Query() query: any, @Res() response: Response) {
    try {
      if (!query.petId) {
        return response.status(HttpStatus.BAD_REQUEST).send({
          error: 'petId required',
        });
      }
      const pet = this.pets.find((pet) => pet.id === parseInt(query.petId, 10));
      if (!pet) {
        return response.status(HttpStatus.NOT_FOUND).send({
          error: 'Pet not found',
        });
      }
      return response.status(HttpStatus.OK).send(pet);
    } catch (ex) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: 'Server error' });
    }
  }*/
}
