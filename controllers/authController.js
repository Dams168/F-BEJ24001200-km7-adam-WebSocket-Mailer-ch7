const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_SALT = parseInt(process.env.BCRYPT_SALT);
const nodemailer = require('nodemailer');


class AuthController {
    static async register(req, res, next) {
        try {
            const { name, email, password } = req.body;
            const uniqueEmail = await prisma.user.findUnique({
                where: {
                    email: email
                }
            });
            if (uniqueEmail) {
                throw { error: 'Email sudah terdaftar', status: 400, message: 'Bad Request' };
            } else {
                const hashedPassword = await bcrypt.hashSync(password, BCRYPT_SALT);
                let createUser = await prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword
                    }
                })
                res.status(201).json({
                    error: null,
                    message: 'User berhasil dibuat',
                    status: 201,
                    data: createUser
                });
            }
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({
                    status: 'failed',
                    message: error.message,
                });
            }
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            let { email, password } = req.body;
            let user = await prisma.user.findUnique({
                where: {
                    email: email
                }
            });
            if (!user) {
                throw { error: 'Not found', status: 400, message: 'Email atau password salah' };
            } else {
                let isPassword = await bcrypt.compareSync(password, user.password);
                if (!isPassword) {
                    throw { error: 'Bad Request', status: 400, message: 'Email atau password salah' };
                } else {
                    const accessToken = jwt.sign({
                        name: user.name,
                        id: user.id,
                    }, JWT_SECRET, {
                        expiresIn: '3h'
                    });

                    res.status(200).json({
                        error: null,
                        message: 'Login berhasil',
                        status: 200,
                        token: accessToken
                    });
                }
            }
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({
                    status: 'failed',
                    message: error.message,
                });
            }
            next(error);
        }
    }

    static async signIn(req, res, next) {
        try {
            res.render('login');
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({
                    status: 'failed',
                    message: error.message,
                });
            }
            next(error);
        }
    }

    static async signUp(req, res, next) {
        try {
            res.render('register');
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({
                    status: 'failed',
                    message: error.message,
                });
            }
            next(error);
        }
    }

    static async confirmEmail(req, res, next) {
        try {
            res.render('confirm-email');
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({
                    status: 'failed',
                    message: error.message,
                });
            }
            next(error);
        }
    }

    static async forgotPassword(req, res, next) {
        try {
            let { email } = req.body;
            let user = await prisma.user.findUnique({
                where: {
                    email: email
                }
            });
            if (!user) {
                throw { error: 'Not found', status: 400, message: 'Email tidak ditemukan' };
            } else {
                const token = jwt.sign({
                    email: user.email,
                    id: user.id,
                }, JWT_SECRET, {
                    expiresIn: '1h'
                })

                let transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    auth: {
                        user: process.env.MAIL_EMAIL,
                        pass: process.env.MAIL_PASSWORD
                    }
                });

                const mailOptions = {
                    from: process.env.MAIL_EMAIL,
                    to: email,
                    subject: 'Reset Password',
                    html: `<a href="http://localhost:3000/reset-password?token=${token}">Reset Password</a>`
                }

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        throw { error: 'Internal Server Error', status: 500, message: 'Gagal mengirim email' };
                    } else {
                        res.status(200).json({
                            error: null,
                            message: 'Email berhasil dikirim',
                            status: 200,
                            token: token,
                            // data: info
                        });
                    }
                });
            }
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({
                    status: 'failed',
                    message: error.message,
                });
            }
            next(error);
        }
    }

}

module.exports = AuthController;