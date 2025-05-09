import { useEffect, useState } from "react";
import FileInput from "./components/FileInput";
import Image from "./components/Image";
import { files } from "./utils/files";

function App() {
  const [file, setFile] = useState<File>();
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [processedUrl, setProcessedUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [stress, setStress] = useState<boolean>(false);
  const [elapsedTimeC, setElapsedTimeC] = useState<number | null>(null); // Tiempo en ms
  const [elapsedTimeJava, setElapsedTimeJava] = useState<number | null>(null); // Tiempo en ms
  const [processedImageFilesC, setProcessedImageFilesC] = useState<string[]>(
    []
  );
  const [processedImageFilesJava, setProcessedImageFilesJava] = useState<
    string[]
  >([]);

  const handleUploadMultiple = async () => {
    const urls: string[] = [];

    for (const imageName of files) {
      const response = await fetch(imageName); // Cargar la imagen desde la URL
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("image", blob, imageName.split("/").pop()); // Usar el nombre del archivo

      const res = await fetch("http://localhost:3000/convert-original", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const blob = await res.blob();
        const processedImgUrl = URL.createObjectURL(blob);
        urls.push(processedImgUrl);
      } else {
        console.error(`Error al convertir la imagen ${imageName}`);
      }
    }

    setImageFiles(urls);
  };

  const handleProcessC = async () => {
    const urlsC: string[] = [];
    const startTime = performance.now();

    for (const imageName of files) {
      const response = await fetch(imageName);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("image", blob, imageName.split("/").pop());

      const res = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const blob = await res.blob();
        const processedImgUrlC = URL.createObjectURL(blob);
        urlsC.push(processedImgUrlC);
      } else {
        console.error(`Error al convertir la imagen ${imageName}`);
      }
    }

    const endTime = performance.now();
    setElapsedTimeC(Math.round(endTime - startTime));
    setProcessedImageFilesC(urlsC);
  };

  const handleProcessJava = async () => {
    const urlsJava: string[] = [];
    const startTime = performance.now();

    for (const imageName of files) {
      const response = await fetch(imageName);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("image", blob, imageName.split("/").pop());

      const res = await fetch("http://localhost:3000/upload-java", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const blob = await res.blob();
        const processedImgUrlJava = URL.createObjectURL(blob);
        urlsJava.push(processedImgUrlJava);
      } else {
        console.error(`Error al convertir la imagen ${imageName}`);
      }
    }

    const endTime = performance.now();
    setElapsedTimeJava(Math.round(endTime - startTime));
    setProcessedImageFilesJava(urlsJava);
  };

  const handleProcessBoth = async () => {
    handleProcessC();
    handleProcessJava();
  }

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    const processedImgUrl = URL.createObjectURL(blob);
    setProcessedUrl(processedImgUrl);
  };

  const handleFileSelect = (selectedFile: File | null) => {
    console.log(selectedFile);
    if (selectedFile) {
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (fileExtension === "pgm") {
        setFile(selectedFile);
        setError("");
      } else {
        setFile(undefined);
        setError("El archivo debe tener extensión .pgm");
      }
    } else {
      setError("");
      setOriginalUrl("");
      setProcessedUrl("");
    }
  };

  const handleReset = (): void => {
    setFile(undefined);
    setError("");
    setOriginalUrl("");
    setProcessedUrl("");
  };

  return (
    <div className="h-screen w-screen bg-black p-8">
      <div className="mx-auto flex flex-col items-center justify-center gap-10 mb-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          Procesador de Imágenes PGM
        </h1>
        {stress ? (
          <div className="flex flex-col w-full items-center justify-center gap-8 mt-6">
            <div className="flex w-full items-center justify-center gap-8 mt-6">
              <div className="flex flex-col justify-start w-full gap-10">
                <h1>Procesamiento en C con multihilos</h1>
                <div className="flex flex-col">
                  <div className="flex justify-center gap-4">
                    {imageFiles.map((file, i) => (
                      <div key={i} className="max-w-50 max-h-50">
                        <Image title={`Imagen #${i}`} url={file} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-4">
                    {processedImageFilesC.map((file, i) => (
                      <div key={i} className="max-w-50 max-h-50">
                        <Image title={`Imagen en Negativo #${i}`} url={file} />
                      </div>
                    ))}
                  </div>
                </div>
                {elapsedTimeC !== null && (
                  <p className="text-center text-green-400">
                    Tiempo total: {elapsedTimeC} ms
                  </p>
                )}
              </div>
            </div>
            <div className="flex w-full items-center justify-center gap-8 mt-6">
            <div className="flex flex-col justify-start w-full gap-10">
                <h1>Procesamiento en Java sin multihilos</h1>
                <div className="flex flex-col">
                  <div className="flex justify-center gap-4">
                    {imageFiles.map((file, i) => (
                      <div key={i} className="max-w-50 max-h-50">
                        <Image title={`Imagen #${i}`} url={file} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-4">
                    {processedImageFilesJava.map((file, i) => (
                      <div key={i} className="max-w-50 max-h-50">
                        <Image title={`Imagen en Negativo #${i}`} url={file} />
                      </div>
                    ))}
                  </div>
                </div>
                {elapsedTimeJava !== null && (
                  <p className="text-center text-green-400">
                    Tiempo total: {elapsedTimeJava} ms
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : originalUrl && error === "" ? (
          <div className="flex w-full items-center justify-center gap-8 mt-6">
            <Image title="Imagen Original" url={originalUrl} />
            {processedUrl && (
              <Image title="Imagen en Negativo" url={processedUrl} />
            )}
          </div>
        ) : (
          <>
            <div className="">
              <FileInput
                onFileSelect={handleFileSelect}
                onProcessedUrl={setProcessedUrl}
                onOriginalUrl={setOriginalUrl}
                label={"Archivo"}
                error={error}
                required
              />
            </div>
          </>
        )}
        <div className="flex flex-col items-center justify-center gap-4 w-[100%]">
          {stress ? (
            <div className="flex items-center justify-center gap-4 w-[37%]">
              <button onClick={handleProcessBoth}>Procesar</button>
              <button onClick={() => setStress(false)}>Volver</button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-4 w-[37%]">
                <button
                  onClick={handleUpload}
                  disabled={file === undefined || error !== ""}
                >
                  Subir y Procesar
                </button>
                <button
                  onClick={handleReset}
                  disabled={file === undefined || error !== ""}
                >
                  Reiniciar
                </button>
              </div>
              <button
                onClick={() => {
                  setStress(true);
                  handleUploadMultiple();
                }}
              >
                Prueba de estrés
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
