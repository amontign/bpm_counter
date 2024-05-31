import fs from 'fs';
import path from 'path';

const tempDir = path.join(process.cwd(), 'tempHLS');

export default async (req, res) => {
  const { file } = req.query; // 'file' contiendra le chemin du fichier demandé
  const filePath = path.join(tempDir, ...file); // Construire le chemin complet du fichier

  // Vérifier si le fichier existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Fichier non trouvé');
  }

  // Déterminer le type de contenu en fonction de l'extension du fichier
  const ext = path.extname(filePath);
  let contentType = 'text/plain';
  if (ext === '.m3u8') {
    contentType = 'application/vnd.apple.mpegurl';
  } else if (ext === '.aac') {
    contentType = 'audio/aac';
  }

  res.setHeader('Content-Type', contentType);
  fs.createReadStream(filePath).pipe(res);
};