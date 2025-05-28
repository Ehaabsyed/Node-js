//script for organizing folder with diff files

import fs from "fs/promises"
import fsn from "fs"
import path from "path"
//enter the path of folder you want to clean
const directorypath = `C:\\Users\\EHAAB SYED\\OneDrive\\Desktop\\code\\nodejs\\file`

let files = await fs.readdir(directorypath)
// console.log(files)

for (const item of files) {
    let ext = item.split(".")[item.split(".").length - 1]
    if (ext != "js" && ext != "json") {
        if (fsn.existsSync(path.join(directorypath, ext))) {
            //move file to their respective directory
            console.log(`moving ${item} to ${ext} folder`)
            fs.rename(path.join(directorypath, item), path.join(directorypath, ext, item))
        } else {
            //creating folder of ext name
            console.log(`creating folder for .${ext}`)
            fs.mkdir(ext)
        }
    }
}