import z from 'zod'

export interface DeletePostByIdInputDTO {
    token: string,
    idToDelete: string
}

export type DeletePostByIdOutputDTO = undefined

export const DeletePostByIdSchema = z.object({
    token: z.string().min(1),
    idToDelete: z.string().min(1)
}).transform(data => data as DeletePostByIdInputDTO)