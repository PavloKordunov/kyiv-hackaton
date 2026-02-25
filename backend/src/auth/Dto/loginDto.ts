import { IsEmail, IsString, MinLength } from "class-validator";

export class loginDto{
    @IsEmail({},{message:"Incorect email format"})
    email:string

    @IsString()
    @MinLength(6)
    password:string
}