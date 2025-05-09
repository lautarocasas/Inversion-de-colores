const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());

const upload = multer({ dest: '../frontend/public/uploads/' });

app.get("/list-images", (req, res) => {
  const directories = [
    path.join(__dirname, "../frontend/public/Imagenes PGM/P2"),
    path.join(__dirname, "../frontend/public/Imagenes PGM/P5"),
  ];
  const images = [];

  directories.forEach((dir) => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        if (file.toLowerCase().endsWith(".pgm")) {
          const relativePath = path.relative(
            path.join(__dirname, "../frontend/public"),
            path.join(dir, file)
          ).replace(/\\/g, "/");
          images.push(`/${relativePath}`);
        }
      });
    }
  });

  res.json(images);
});

app.post('/convert-all', (req, res) => {
  const dirPath = path.join(__dirname, '..', 'frontend', 'public', 'Imagenes PGM', 'P2');
  const processedDir = path.join(__dirname, 'processed');

  console.log("Ruta de la carpeta:", dirPath);

  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir);
  }

  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error("Error al leer la carpeta:", err);
      return res.status(500).json({ error: 'Error al leer la carpeta', details: err.message });
    }

    const pgmFiles = files.filter(file => file.endsWith('.pgm'));
    const convertedImages = [];

    pgmFiles.forEach((file, index) => {
      const inputPath = path.join(dirPath, file);
      const outputPng = path.join(processedDir, `${file}-original.png`);

      exec(`magick "${inputPath}" "${outputPng}"`, (err) => {
        if (err) {
          console.error(`Error convirtiendo ${file}:`, err);
        } else {
          convertedImages.push(`/processed/${file}-original.png`);
        }

        if (index === pgmFiles.length - 1) {
          // Enviar las rutas convertidas al frontend
          res.json({ convertedImages });
        }
      });
    });
  });
});



app.post('/convert-original', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha recibido el archivo' });
  }

  const inputPath = req.file.path;
  const filename = req.file.filename;
  const outputPng = path.join('processed', `${filename}-original.png`);

  if (!fs.existsSync('processed')) {
    fs.mkdirSync('processed');
  }

  // Convertir directamente el archivo original .pgm a .png
  exec(`magick "${inputPath}" "${outputPng}"`, (err, stdout, stderr) => {
    if (err) {
      console.error('Error convirtiendo original:', err);
      return res.status(500).json({ error: 'Error al convertir imagen original', details: stderr });
    }

    console.log('Imagen original convertida a PNG:', outputPng);
    res.sendFile(path.resolve(outputPng));
  });
});

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha recibido el archivo de imagen' });
  }

  console.log('Archivo recibido:', req.file);

  const inputPath = req.file.path;
  const filename = req.file.filename;
  const outputPgm = path.join('processed', `${filename}.pgm`);
  const outputPng = path.join('processed', `${filename}.png`);

  // Asegurar que la carpeta 'processed' exista
  if (!fs.existsSync('processed')) {
    fs.mkdirSync('processed');
  }

  // Llamar al programa C para procesar la imagen
  const exePath = path.resolve(__dirname, 'pgm_negative'); // o pgm_negative.exe según el nombre real
  exec(`${exePath} "${inputPath}" "${outputPgm}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error ejecutando el programa C:', error);
      return res.status(500).json({ error: 'Error procesando la imagen', details: stderr });
    }
    console.log(stdout)

    // Convertir a PNG con ImageMagick
    exec(`magick "${outputPgm}" "${outputPng}"`, (convErr, convOut, convStderr) => {
      if (convErr) {
        console.error('Error convirtiendo a PNG:', convErr);
        return res.status(500).json({ error: 'Error al convertir a PNG', details: convStderr });
      }

      console.log('Imagen convertida a PNG:', outputPng);

      // Enviar la imagen convertida al frontend
      res.sendFile(path.resolve(outputPng));
    });
  });
});

app.post('/upload-java', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha recibido el archivo de imagen' });
  }

  console.log('Archivo recibido:', req.file);

  const inputPath = req.file.path;
  const filename = req.file.filename;
  const outputPgm = path.join('processed', `${filename}.pgm`);
  const outputPng = path.join('processed', `${filename}.png`);

  // Asegurar que la carpeta 'processed' exista
  if (!fs.existsSync('processed')) {
    fs.mkdirSync('processed');
  }

  // Llamar al programa Java para procesar la imagen
  const className = 'InversionColores';
  exec(`java -cp "${__dirname}" ${className} "${inputPath}" "${outputPgm}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error ejecutando el programa Java:', error);
      return res.status(500).json({ error: 'Error procesando la imagen', details: stderr });
    }
    console.log(stdout)

    // Convertir a PNG con ImageMagick
    exec(`magick "${outputPgm}" "${outputPng}"`, (convErr, convOut, convStderr) => {
      if (convErr) {
        console.error('Error convirtiendo a PNG:', convErr);
        return res.status(500).json({ error: 'Error al convertir a PNG', details: convStderr });
      }

      console.log('Imagen convertida a PNG:', outputPng);

      // Enviar la imagen convertida al frontend
      res.sendFile(path.resolve(outputPng));
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
