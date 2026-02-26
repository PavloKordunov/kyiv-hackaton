import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class loginDto{
    @IsNotEmpty()
    @IsEmail({},{message:"Incorect email format"})
    email:string

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password:string
}