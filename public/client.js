const fileInputElement = document.getElementById('file-input')
const shareButton = document.getElementById('share-btn')
const filesNum = document.getElementById('files-num')
const socket = io()

window.addEventListener('load', () => {
    let newFile = {
        buffer: [],
        transmitted: 0,
        metadata: null
    }

    socket.on('file-metadata', metadata => {
        newFile.metadata = metadata
        newFile.transmitted = 0
        newFile.buffer = []

        console.log('received metadata', newFile)
    })

    socket.on('file-chunk', chunk => {
        console.log('received chunk', newFile.metadata.filename, newFile.buffer.length)

        newFile.buffer.push(chunk)
        newFile.transmitted = chunk.length

        if (newFile.buffer.length === newFile.metadata.bufferSize) {
            let ff = new Blob(newFile.buffer)
            downloadBlob(ff, newFile.metadata.filename);


            newFile = {}
            console.log('done sending 🎉')
        }
    })
})

function downloadBlob(blob, name = 'file.txt') {
   
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = blobUrl;
    link.download = name;
    document.body.appendChild(link);
    
    link.dispatchEvent(
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
    );

    document.body.removeChild(link);
}

function fileSelected() {
    filesNum.textContent = fileInputElement.files.length
}

function initFileShare(metadata, buffer) {

    socket.emit('file-metadata', metadata)

    let chunkSize = 1024
    let initialChunk = 0

    while (initialChunk < metadata.bufferSize) {

        let filePiece = buffer.slice(0, chunkSize)
        console.log(metadata.bufferSize, filePiece.length)

        socket.emit('file-chunk', filePiece)

        initialChunk++;
    }
}

shareButton.addEventListener('click', async () => {

    let file = fileInputElement.files[0]
    let reader = new FileReader()

    reader.onload = () => {
        let buffer = new Uint8Array(reader.result)
        initFileShare({ filename: file.name, bufferSize: buffer.length }, buffer)
    }

    reader.readAsArrayBuffer(file)
})