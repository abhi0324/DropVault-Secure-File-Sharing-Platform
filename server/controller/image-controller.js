import File from "../models/file.js";
export const uploadImage = async (req, res)=> {
    const fileObj = {
        path: req.file.path,
        name: req.file.originalname,
    }

    try {
        const file = await File.create(fileObj);
        const host = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
        res.status(200).json({
            msg: "File uploaded succesfully",
            path: `${host}/file/${file._id}`
        }); 
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({msg: "Error uploading file", error: error.message});
    }
}

export const getImage = async (req, res) => {
    try {
        const fileID = req.params.fileId;
        const file = await File.findById(fileID);
        if(!file){
            return res.status(404).json({msg: "file not found"});
        }
        res.download(file.path, file.name);
        file.downloadCount++;
        await file.save();
    }
    catch (error) {
        console.error(error.message);
        res.status(500).json({msg: "Error downloading file", error: error.message});
    }
}


