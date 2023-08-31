import {validate} from "../validation/validation.js";
import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import { 
    getUserValidation,
    loginUserValidation, 
    registerUserValidation, 
    updateUserValidation
} from "../validation/user-validation.js"
import bcrypt from "bcrypt";
import {v4 as uuid} from "uuid";
// import { request } from "express";

const register = async (request) => {
    const user = validate(registerUserValidation, request);

    const countUser = await prismaClient.user.count({
        where: {
            username: user.username
        }
    });

    if(countUser === 1) {
        throw new ResponseError(401, "Username already exists");
    }

    user.password = await bcrypt.hash(user.password, 10);

    return prismaClient.user.create({
        data: user,
        select: {
            id: true,
            username: true,
            name: true
        }
    })
}

const login = async (request) => {
    // validasi data dari form
    const loginRequest = validate(loginUserValidation, request);

    // Check data user dengan data dari database
    const user = await prismaClient.user.findUnique({
        where: {
            username: loginRequest.username
        },
        select: {
            username: true,
            password: true
        },

    });

    // jika user tidak ada response eror
    if (!user) {
        throw new ResponseError(401, "Username or password wrong");
    }

    // check password menggunakan bcrypt dengan membandingkan password dari request 
    // --- dengan data password db
    const isPasswordValid = await bcrypt.compare(loginRequest.password, user.password);
    if(!isPasswordValid){
        throw new ResponseError(401, "Username or password wrong");
    }

    // Buat token dan update token user di database
    const token = uuid().toString();
    return prismaClient.user.update({
        data: {
            token: token
        },
        where: {
            username: user.username
        },
        select: {
            token: true
        }
    });

}

const get = async (username) => {
    username = validate(getUserValidation, username);

    const user = await prismaClient.user.findUnique({
        where: {
            username: username
        },
        select: {
            username: true,
            name: true
        }
    })

    if(!user){
        throw new ResponseError(404, "user not found")
    }

    return user;
}

const update = async (request) => {
    const user = validate(updateUserValidation, request);

    const totalUserInDB = await prismaClient.user.count({
        where: {
            username: user.username
        }
    });

    if(totalUserInDB !== 1) {
        throw new ResponseError(404, "User not found")
    }

    const data = {};
    if (user.name){
        data.name = user.name;
    }
    if(user.password){
        data.password = await bcrypt.hash(user.password, 10);
    }

    return prismaClient.user.update({
        where: {
            username: user.username
        },
        data: data,
        select: {
            username: true,
            name: true
        }
    })

}

const logout = async (username) => {
    username = validate(getUserValidation, username);

    const user = await prismaClient.user.findUnique({
        where: {
            username: username
        }
    });

    if(!user){
        throw new ResponseError(404, "user not found");
    }

    // remove token user from db
    return prismaClient.user.update({
        where: {
            username: username
        },
        data: {
            token: null
        },
        select: {
            username: true
        }
    })

}

export default {
    register,
    login,
    get,
    update,
    logout
}




