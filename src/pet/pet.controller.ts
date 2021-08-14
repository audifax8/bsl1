import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import * as Joi from 'joi';
import Knex from 'knex';
import { NestjsKnexService } from 'nestjs-knexjs';

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

enum PetCategory {
  DOG = 'dog',
  CAT = 'cat',
}

const schema = Joi.object({
  name: Joi.string().required(),
  last_name: Joi.string().required(),
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

  @Get()
  public async get(@Res() response: Response) {
    const data = await this.knex('test').select('*');
    //Logger.log({ data, pets });
    return response.status(HttpStatus.OK).send({ data });
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

  @Post('axios')
  public async postAxios(@Res() response: Response, @Body() body: any) {
    try {
      const result = schema.validate(body);
      if (result.error) {
        return response.status(HttpStatus.BAD_REQUEST).send({
          error: 'Invalid request body',
        });
      }
      const id = uuidv4();
      const data = await this.knex('test').insert({
        id,
        last_name: body.last_name,
        name: body.name,
      });
      //Logger.log(data);
      return response.status(HttpStatus.CREATED).send({ data });
    } catch (ex) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: 'Server error' });
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
