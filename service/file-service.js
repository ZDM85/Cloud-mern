const fs = require("fs")


class FileService {
    createDir(file) {
        const filePath = this.getPath(file);
        return new Promise(((resolve, reject) => {
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath);
                return resolve({message: "Файл создан!"});
            } else {
                return reject({message: "Такой файл уже существует!"})
            }
        }))
    }

    deleteFile(file) {
        const path = this.getPath(file);
        if (file.type === "dir") {
            fs.rmdirSync(path);
        } else {
            fs.unlinkSync(path);
        }
    }

    getPath(file) {
        return process.env.FILE_PATH + "\\" + file.user + "\\" + file.path;
    }
}

module.exports = new FileService();