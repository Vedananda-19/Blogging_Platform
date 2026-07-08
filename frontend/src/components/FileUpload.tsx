import React, { useRef, useState } from "react";
import api from "../apis/api";

const FileUpload = ({setDisplay, setImageURL}:any) => {
    const uploadRef = useRef<HTMLInputElement|null>(null)
    const [errorMsg,setErrorMsg] = useState("")

    const uploadImage = async (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith("image/")) {
            setErrorMsg("Please select an image");
            return;
        }
        const formData = new FormData
        formData.append("file",file)
        try{
            const response = await api.post("/user/upload",formData)
            setImageURL && setImageURL(response.data.url)
            setDisplay(false)
        }catch(e){
            console.log(e)
            setErrorMsg("An error Occurend while uploading the image")
        }
    }
    return (
        <div>
            <div>
                <h3>Add Images</h3>
                <button onClick={() => setDisplay(false)}>Close</button>
            </div>
            <div>
                <div onClick={()=>{uploadRef.current?.click()}}>
                    Browse Files
                    <input
                        ref={uploadRef}
                        type="file"
                        onChange={(e)=>uploadImage(e)}
                        accept="image/*"
                        hidden
                    />
                </div>
                {errorMsg && <p>{errorMsg}</p>}
            </div>
        </div>
    );
};

export default FileUpload;
