import { Request, Response } from "express";
import { PostBusiness } from "../business/PostBusiness";
import { ZodError } from "zod";
import { BaseError } from "../errors/BaseError";
import { CreatePostSchema } from "../dtos/posts/createPost.dto";
import { GetPostsSchema } from "../dtos/posts/getPosts.dto";
import { EditPostSchema } from "../dtos/posts/editPost.dto";
import { DeletePostByIdSchema } from "../dtos/posts/deletePostById.dto";

export class PostController {
  constructor(private postBusiness: PostBusiness) {}

  public createPost = async (req: Request, res: Response) => {
    try {
      const input = CreatePostSchema.parse({
        content: req.body.content,
        token: req.headers.authorization,
      });
      const output = await this.postBusiness.createPost(input);
      res.status(201).send(output);
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        res.status(400).send(error.issues);
      } else if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }
  };
  public getPosts = async (req: Request, res: Response) => {
    try {
      const input = GetPostsSchema.parse({
        token: req.headers.authorization,
      });
      const output = await this.postBusiness.getPosts(input);

      res.status(200).send(output);
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        res.status(400).send(error.issues);
      } else if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }
  };

  public editPostById = async (req: Request, res: Response) => {
    try {
      const input = EditPostSchema.parse({
        content: req.body.content,
        token: req.headers.authorization,
        idToEdit: req.params.id,
      });
      const output = await this.postBusiness.editPostById(input);
      res.status(200).send(output);
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        res.status(400).send(error.issues);
      } else if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }
  };

  public deletePostById = async (req: Request, res: Response) => {
    try {
      const input = DeletePostByIdSchema.parse({
        token: req.headers.authorization,
        idToDelete: req.params.id,
      });

      const output = await this.postBusiness.deletePostById(input);

      res.status(200).send(output);
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        res.status(400).send(error.issues);
      } else if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message);
      } else {
        res.status(500).send("Erro inesperado");
      }
    }
  };
}
