const fileService = require("../service/file-service");
const fileModel = require("../models/file-model");
const userModel = require("../models/user-model");
const ApiError = require("../exceptions/api-error");
const fs = require("fs");
const uuid = require("uuid");
const path = require("path");

class FileController {
    async createDir(req, res, next) {
        try {
            const {name, type, parent} = req.body;
            const file = await fileModel.create({name, type, parent, user: req.user.id});
            const parentPath = await fileModel.findOne({_id: parent});
            if (!parentPath) {
                file.path = name;
                await fileService.createDir(file);
            } else {
                file.path = `${parentPath.path}\\${file.name}`;
                await fileService.createDir(file);
                parentPath.childs.push(file._id);
                await parentPath.save();
            }
            await file.save();
            return res.json(file);
        } catch (e) {
            next(e)
        }
    }

    async getFiles(req, res, next) {
        try {
            const {sort} = req.query;
            let files;
            switch (sort) {
                case "name":
                    files = await fileModel.find({user: req.user.id, parent: req.query.parent}).sort({name:1});
                    break;
                case "type":
                    files = await fileModel.find({user: req.user.id, parent: req.query.parent}).sort({type:1});
                    break;
                case "date":
                    files = await fileModel.find({user: req.user.id, parent: req.query.parent}).sort({date:1});
                    break;
                default:
                    files = await fileModel.find({user: req.user.id, parent: req.query.parent})
                    break;    
            }
            return res.json(files);
        } catch (e) {
            next(e)
        }
    }

    async uploadFile(req, res, next) {
        try {
            const file = req.files.file;

            const parent = await fileModel.findOne({_id: req.body.parent, user: req.user.id});
            const user = await userModel.findOne({_id: req.user.id});
            if (!user) {
                return next(ApiError.BadRequest("Пользователь не найден")); 
            }
            if (user.usedSpace + file.size > user.diskSpace) {
                return next(ApiError.BadRequest("Нет места на диске")); 
            }

            user.usedSpace = user.usedSpace + file.size;

            let path;
            if (parent) {
                path = `${process.env.FILE_PATH}\\${user._id}\\${parent.path}\\${file.name}`
            } else {
                path = `${process.env.FILE_PATH}\\${user._id}\\${file.name}`
            }

            if (fs.existsSync(path)) {
                return next(ApiError.BadRequest("Такой файл уже существует")); 
            }
            
            file.mv(path);

            const type = file.name.split(".").pop();
            let filePath = file.name;
            if (parent) {
                filePath = `${parent.path}\\${file.name}`;
            }
            const dbFile = new fileModel({
                name: file.name,
                type,
                path: filePath,
                parent: parent ? parent._id : null,
                size: file.size,
                user: user._id
            });
            await dbFile.save();
            await user.save();
            return res.json(dbFile);
        } catch (e) {
            next(e)
        }
    }

    async downloadFile(req, res, next) {
        try {
            const file = await fileModel.findOne({_id: req.query.id, user: req.user.id});
            if (!file) {
                return next(ApiError.BadRequest("Файл не найден!")); 
            }
            const path = fileService.getPath(file);
            
            if (fs.existsSync(path)) {
                return res.download(path, file.name);
            }
            return next(ApiError.BadRequest("Файл не существует!")); 
        } catch (e) {
            next(e)
        }
    }

    async deleteFile(req, res, next) {
        try {
            const file = await fileModel.findOne({_id: req.query.id, user: req.user.id});
            fileService.deleteFile(file);
            await file.deleteOne();
            return res.json({file, message: "Файл был удален"});
        } catch (e) {
            next(e)
        }
    }

    async searchFile(req, res, next) {
        try {
            const searchName = req.query.search;
            let files = await fileModel.find({user: req.user.id});
            files = files.filter(file => file.name.includes(searchName));
            return res.json(files);
        } catch (e) {
            next(e)
        }
    }

    async uploadAvatar(req, res, next) {
        try {
            const file = req.files.file;
            const user = await userModel.findById(req.user.id);
            const avatarName = uuid.v4() + ".jpg";
            file.mv(path.resolve(__dirname, "..", "static", avatarName));
            user.avatar = avatarName;
            await user.save();
            return res.json(user);
        } catch (e) {
            next(e)
        }
    }

    async deleteAvatar(req, res, next) {
        try {
            const user = await userModel.findById(req.user.id);
            fs.unlinkSync(process.env.FILE_STATIC + "//" + user.avatar);
            user.avatar = null;
            await user.save();
            return res.json(user);
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new FileController();