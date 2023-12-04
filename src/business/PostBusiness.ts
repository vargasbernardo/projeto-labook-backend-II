import { PostDatabase } from "../database/PostDatabase";
import {
  CreatePostInputDTO,
  CreatePostOutputDTO,
} from "../dtos/posts/createPost.dto";
import {
  DeletePostByIdInputDTO,
  DeletePostByIdOutputDTO,
} from "../dtos/posts/deletePostById.dto";
import {
  EditPostInputDTO,
  EditPostOutputDTO,
} from "../dtos/posts/editPost.dto";
import {
  GetPostsInputDTO,
  GetPostsOutputDTO,
} from "../dtos/posts/getPosts.dto";
import { LikeOrDislikePostInputDTO, LikeOrDislikePostOutputDTO } from "../dtos/posts/likeOrDislikePost.dto";
import { ForbiddenError } from "../errors/ForbiddenError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { LikeDislikeDB, POST_LIKE, Post } from "../models/Post";
import { USER_ROLES } from "../models/User";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export class PostBusiness {
  constructor(
    private postDatabase: PostDatabase,
    private idGenerator: IdGenerator,
    private tokenManager: TokenManager
  ) {}
  public createPost = async (
    input: CreatePostInputDTO
  ): Promise<CreatePostOutputDTO> => {
    const { content, token } = input;

    const payload = this.tokenManager.getPayload(token);
    if (!payload) {
      throw new UnauthorizedError();
    }

    const id = this.idGenerator.generate();
    const post = new Post(
      id,
      content,
      0,
      0,
      new Date().toISOString(),
      new Date().toISOString(),
      payload.id,
      payload.name
    );

    await this.postDatabase.insertPost(post.toDBModel());

    const output: CreatePostOutputDTO = undefined;
    return output;
  };

  public getPosts = async (
    input: GetPostsInputDTO
  ): Promise<GetPostsOutputDTO> => {
    const { token } = input;

    const payload = this.tokenManager.getPayload(token);
    if (!payload) {
      throw new UnauthorizedError();
    }

    const PostDBWithCreatorName =
      await this.postDatabase.getPostsWithCreatorName();

    const posts = PostDBWithCreatorName.map((postWithCreatorName) => {
      const post = new Post(
        postWithCreatorName.id,
        postWithCreatorName.content,
        postWithCreatorName.likes,
        postWithCreatorName.dislikes,
        postWithCreatorName.created_at,
        postWithCreatorName.updated_at,
        postWithCreatorName.creator_id,
        postWithCreatorName.creator_name
      );
      return post.toBusinessModel();
    });
    const output: GetPostsOutputDTO = posts;
    return output;
  };

  public editPostById = async (
    input: EditPostInputDTO
  ): Promise<EditPostOutputDTO> => {
    const { content, token, idToEdit } = input;

    const payload = this.tokenManager.getPayload(token);
    if (!payload) {
      throw new UnauthorizedError();
    }

    const postDB = await this.postDatabase.fetchPost(idToEdit);
    if (!postDB) {
      throw new NotFoundError("Post nao encontrado");
    }
    if (payload.id !== postDB.creator_id) {
      throw new ForbiddenError("Somente quem criou o post pode edita-lo");
    }
    const post = new Post(
      postDB.id,
      postDB.content,
      postDB.likes,
      postDB.dislikes,
      postDB.created_at,
      postDB.updated_at,
      postDB.creator_id,
      payload.name
    );
    post.setContent(content);

    const updatedPostDB = post.toDBModel();
    await this.postDatabase.updatePost(updatedPostDB);

    const output: CreatePostOutputDTO = undefined;
    return output;
  };

  public deletePostById = async (
    input: DeletePostByIdInputDTO
  ): Promise<DeletePostByIdOutputDTO> => {
    const { token, idToDelete } = input;

    const payload = this.tokenManager.getPayload(token);
    if (!payload) {
      throw new UnauthorizedError();
    }

    const postDB = await this.postDatabase.fetchPost(idToDelete);
    if (!postDB) {
      throw new NotFoundError("Post nao encontrado");
    }

    if (payload.role !== USER_ROLES.ADMIN) {
      if (payload.id !== postDB.creator_id) {
        throw new ForbiddenError("Soment quem criou o post pode deleta-lo");
      }
    }

    await this.postDatabase.deletePostUsingId(idToDelete);

    const output: DeletePostByIdOutputDTO = undefined;
    return output;
  };

  public likeOrDislikePost = async(input: LikeOrDislikePostInputDTO): Promise<LikeOrDislikePostOutputDTO> => {
    const { token, postId, like} = input

    const payload = this.tokenManager.getPayload(token)
    if(!payload) {
      throw new UnauthorizedError()
    }

    const PostDBWithCreatorName = await this.postDatabase.fetchPostByIdWithCreatorName(postId)
    if(!PostDBWithCreatorName) {
      throw new NotFoundError('Post nao existe')
    }

    const post = new Post(
      PostDBWithCreatorName.id,
      PostDBWithCreatorName.content,
      PostDBWithCreatorName.likes,
      PostDBWithCreatorName.dislikes,
      PostDBWithCreatorName.created_at,
      PostDBWithCreatorName.updated_at,
      PostDBWithCreatorName.creator_id,
      PostDBWithCreatorName.creator_name
    )

    
    const likeDislikeDB: LikeDislikeDB = {
      user_id: payload.id,
      post_id: postId,
      like: like ? 1 : 0
    }

    const likeDislikeExists = await this.postDatabase.findLikeDislike(
      likeDislikeDB
    );
    if(likeDislikeExists === POST_LIKE.ALREADY_LIKED) {
      if(like) {
        await this.postDatabase.removeLikeDislike(likeDislikeDB)
        post.removeLike()
      } else {
        await this.postDatabase.updateLikeDislike(likeDislikeDB)
        post.removeLike()
        post.addDislike
      }
    } else if (likeDislikeExists === POST_LIKE.ALREADY_DISLIKED) {
      if(like === false) {
        await this.postDatabase.removeLikeDislike(likeDislikeDB)
        post.removeDislike()
      } else {
        await this.postDatabase.updateLikeDislike(likeDislikeDB)
        post.removeDislike()
        post.addLike()
      }
    } else {
      await this.postDatabase.insertLikeDislike(likeDislikeDB)
      like ? post.addLike() : post.addDislike()
    }
    const updatedPostDB = post.toDBModel()
    await this.postDatabase.updatePost(updatedPostDB)
    const output: LikeOrDislikePostOutputDTO = undefined
    return output
  }
}
