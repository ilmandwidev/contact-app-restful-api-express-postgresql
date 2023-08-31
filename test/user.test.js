import supertest from "supertest";
import { logger } from "../src/application/logging.js";
import {web} from "../src/application/web.js";
import { createTestUser, getTestUser, removeTestUser } from "./test-helper.js";
import bcrypt from "bcrypt";

describe("run all", () => {
    describe('POST /api/users', () => {
    
        // perintah ini dijalan setiap test satu method it telah dijalankan
        afterEach(async () => {
            await removeTestUser();
        });
        // Uji jika berhasil
        it('should can register new user', async () => {
            const result = await supertest(web)
                .post('/api/users')
                .send({
                    username: 'test',
                    password: 'rahasia',
                    name: 'test'
                });
    
            expect(result.status).toBe(200);
            expect(result.body.data.username).toBe("test");
            expect(result.body.data.name).toBe("test");
            expect(result.body.password).toBeUndefined();
        })
        // ! Tidak hanya uji jika berhasil tetapi invalid dan error juga
        it('should reject if request is invalid', async () => {
            const result = await supertest(web)
            .post('/api/users')
            .send({
                username: '',
                password: '',
                name: ''
            });
            
            logger.info(result.body);
            expect(result.status).toBe(400);
            expect(result.body.errors).toBeDefined();
            
        })
        // ! Tidak hanya uji jika berhasil tetapi invalid (username sudah ada)
        it('should invalid because user already', async () => {
            let result = await supertest(web)
                .post('/api/users')
                .send({
                    username: 'test',
                    password: 'rahasia',
                    name: 'test'
                });
            
            logger.info(result.body);
            expect(result.status).toBe(200);
            expect(result.body.data.username).toBe("test");
            expect(result.body.data.name).toBe("test");
            expect(result.body.password).toBeUndefined();
    
            result = await supertest(web)
                .post('/api/users')
                .send({
                    username: 'test',
                    password: 'rahasia',
                    name: 'test'
                });
            
            logger.info(result.body);
            expect(result.status).toBe(400);
            expect(result.body.errors).toBeDefined();
        })
    
    });
    
    describe('POST /api/users/login', () => {
    
        // dijalankan sebelum setiap kali it dijalankan
        beforeEach(async () => {
            await createTestUser();
        });
    
        // dijalankan sesudah setiap kali it dijalankan
        afterEach(async () => {
            await removeTestUser();
        });
    
        it('should can login', async () => {
            const result = await supertest(web)
                .post('/api/users/login')
                .send({
                    username: "test",
                    password: "rahasia"
                });
    
            logger.info(result.body);
    
            expect(result.status).toBe(200);
            expect(result.body.data.token).toBeDefined();
            expect(result.body.data.token).not.toBe("test");
        });
    
        it('should reject login if request is invalid', async () => {
            const result = await supertest(web)
                .post('/api/users/login')
                .send({
                    username: "",
                    password: ""
                });
    
            logger.info(result.body);
    
            expect(result.status).toBe(400);
            expect(result.body.errors).toBeDefined();
    
        });
    
        it('should reject login if password is wrong', async () => {
            const result = await supertest(web)
                .post('/api/users/login')
                .send({
                    username: "test",
                    password: "salah"
                });
    
            logger.info(result.body);
    
            expect(result.status).toBe(401);
            expect(result.body.errors).toBeDefined();
    
        });
    
        it('should reject login if username is wrong', async () => {
            const result = await supertest(web)
                .post('/api/users/login')
                .send({
                    username: "salah",
                    password: "salah"
                });
    
            logger.info(result.body);
    
            expect(result.status).toBe(401);
            expect(result.body.errors).toBeDefined();
    
        });
    
    
    });
    
    describe('GET /api/users/current', () => {
         // dijalankan sebelum setiap kali it dijalankan
         beforeEach(async () => {
            await createTestUser();
        });
    
        // dijalankan sesudah setiap kali it dijalankan
        afterEach(async () => {
            await removeTestUser();
        });
    
        it("should can get current user", async () => {
            const result = await supertest(web)
                .get('/api/users/current')
                .set('Authorization', 'test');
    
            expect(result.status).toBe(200);
            expect(result.body.data.username).toBe("test");
            expect(result.body.data.name).toBe("test");
        })
    
        it("should reject if token is invalid", async () => {
            const result = await supertest(web)
                .get('/api/users/current')
                .set('Authorization', 'salah');
    
            expect(result.status).toBe(401);
            expect(result.body.errors).toBeDefined();
        })
    })
    describe('PATCH /api/users/current', () => {
         // dijalankan sebelum setiap kali it dijalankan
         beforeEach(async () => {
            await createTestUser();
        });
    
        // dijalankan sesudah setiap kali it dijalankan
        afterEach(async () => {
            await removeTestUser();
        });
    
        it("should can update user", async () => {
            const result = await supertest(web)
                .patch('/api/users/current')
                .set('Authorization', 'test')
                .send({
                    name: "Ilman",
                    password: "rahasialagi"
                });
    
            expect(result.status).toBe(200);
            expect(result.body.data.username).toBe("test");
            expect(result.body.data.name).toBe("Ilman");
    
            const user = await getTestUser();
            expect(await bcrypt.compare("rahasialagi", user.password)).toBe(true);
        })
    
        it("should can update user name", async () => {
            const result = await supertest(web)
                .patch('/api/users/current')
                .set('Authorization', 'test')
                .send({
                    name: "Ilman",
                    
                });
    
            expect(result.status).toBe(200);
            expect(result.body.data.username).toBe("test");
            expect(result.body.data.name).toBe("Ilman");
    
        })
    
        it("should can update user password", async () => {
            const result = await supertest(web)
                .patch('/api/users/current')
                .set('Authorization', 'test')
                .send({
                    password: "rahasialagi",
                    
                });
    
                expect(result.status).toBe(200);
                expect(result.body.data.username).toBe("test");
                expect(result.body.data.name).toBe("test");
        
                const user = await getTestUser();
                expect(await bcrypt.compare("rahasialagi", user.password)).toBe(true);
          
        })
    
        it("should can update user name", async () => {
            const result = await supertest(web)
                .patch('/api/users/current')
                .set('Authorization', 'salah')
                .send({});
    
                expect(result.status).toBe(401);
     
        })
    
    });
    
    describe("DELETE /api/users/logout", () => {
        // dijalankan sebelum setiap kali it dijalankan
        beforeEach(async () => {
            await createTestUser();
        });
    
        // dijalankan sesudah setiap kali it dijalankan
        afterEach(async () => {
            await removeTestUser();
        });
    
        it("it should be logout", async () => {
            const result = await supertest(web)
                .delete('/api/users/logout')
                .set('Authorization', 'test');
    
            console.info(result.text);
            expect(result.status).toBe(200);
            expect(result.body.data).toBe("ok");
    
            const user = await getTestUser();
            expect(user.token).toBeNull();
        })
    
        it("it should be reject if invalid token", async () => {
            const result = await supertest(web)
                .delete('/api/users/logout')
                .set('Authorization', 'salah');
    
            expect(result.status).toBe(401);
    
        })
    })
} )

