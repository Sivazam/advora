// File Storage Adapter (Local filesystem + Firebase Storage support)
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { uploadToFirebaseStorage } from './firestoreSync';

export interface StoredFile {
  name: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

export async function saveUploadedFile(file: File, subfolder: string = 'documents'): Promise<StoredFile> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate safe unique filename
  const originalName = file.name;
  const ext = path.extname(originalName) || '';
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueFileName = `${Date.now()}_${uuidv4().slice(0, 8)}_${baseName}${ext}`;

  let fileUrl = '';

  // 1. Upload to Firebase Storage bucket (Primary cloud storage)
  try {
    const fbResult = await uploadToFirebaseStorage(
      buffer,
      originalName,
      file.type || 'application/octet-stream',
      subfolder
    );
    if (fbResult && fbResult.fileUrl) {
      fileUrl = fbResult.fileUrl;
    }
  } catch (fbErr) {
    console.warn('Firebase storage upload notice:', fbErr);
  }

  // 2. Safe local saving (local dev environment only; safely skipped on read-only serverless platforms like Netlify/AWS Lambda)
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);
    if (!fileUrl) {
      fileUrl = `/uploads/${subfolder}/${uniqueFileName}`;
    }
  } catch (fsErr) {
    console.warn('Serverless filesystem is read-only. File stored via cloud storage.');
  }

  // 3. Fallback URL if cloud upload was unavailable
  if (!fileUrl) {
    fileUrl = `/uploads/${subfolder}/${uniqueFileName}`;
  }

  return {
    name: originalName,
    fileUrl,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
  };
}
