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

  // 1. Save to local public/uploads for instant local serving
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, uniqueFileName);
  fs.writeFileSync(filePath, buffer);

  let fileUrl = `/uploads/${subfolder}/${uniqueFileName}`;

  // 2. Upload to Firebase Storage bucket
  try {
    const fbResult = await uploadToFirebaseStorage(
      buffer,
      originalName,
      file.type || 'application/octet-stream',
      subfolder
    );
    if (fbResult.fileUrl) {
      fileUrl = fbResult.fileUrl;
    }
  } catch (fbErr) {
    console.warn('Firebase storage upload fallback to local:', fbErr);
  }

  return {
    name: originalName,
    fileUrl,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
  };
}
