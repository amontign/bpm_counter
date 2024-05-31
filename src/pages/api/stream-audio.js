import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import fs, { readdir, stat, unlink } from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdirAsync = promisify(readdir);
const statAsync = promisify(stat);
const unlinkAsync = promisify(unlink);

const tempDir = path.join(process.cwd(), 'tempHLS');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

async function cleanupOldFiles(dirPath, ageLimitInHours = 1) {
  try {
    const files = await readdirAsync(dirPath);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const fileStat = await statAsync(filePath);

      const fileAgeInHours = (now - fileStat.mtimeMs) / (1000 * 60 * 60);

      if (fileAgeInHours > ageLimitInHours) {
        await unlinkAsync(filePath);
        //console.log(`Supprimé: ${filePath}`);
      }
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage des fichiers :', error);
  }
}

export default async (req, res) => {
  const { url, id } = req.query;

  if (typeof url !== 'string' || !ytdl.validateURL(url)) {
    return res.status(400).send('URL invalide');
  }

  await cleanupOldFiles(tempDir, 1);

  const outputPlaylist = path.join(tempDir, `output_${id}.m3u8`).replace(/\s+/g, '');
  if (fs.existsSync(outputPlaylist)) {
    return res.send({ message: "success" });
  }

  try {
    const stream = ytdl(url, { filter: 'audioonly' });
    let firstSegmentCreated = false;

    const watcher = fs.watch(tempDir, (eventType, filename) => {
      if (!firstSegmentCreated && filename.includes(`segment${id}000.aac`)) {
        firstSegmentCreated = true;
        watcher.close();
        res.send({ message: "success" });
      }
    });

    ffmpeg(stream)
      .audioCodec('aac') // ou 'libmp3lame' pour MP3
      .format('hls')
      .addOptions([
        '-hls_time 5', // Durée de chaque segment de 10 secondes
        '-hls_list_size 0', // Garde tous les segments dans la playlist
        '-hls_segment_filename', path.join(tempDir, `segment${id}%03d.aac`)
      ])
      .output(outputPlaylist)
      .on('error', (err) => {
        console.error('Erreur lors du transcodage :', err);
        res.status(500).send('Erreur lors du transcodage');
      })
      .on('end', () => {
        //console.log('Transcodage terminé');
      })
      .run();
    
    
  } catch (error) {
    res.status(500).send('Erreur lors du streaming');
  }
};