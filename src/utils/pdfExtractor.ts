declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

export interface ExtractionProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
}

export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<string> {
  if (!window.pdfjsLib) {
    throw new Error('PDF.js reader engine is still initializing or could not be loaded. Please paste text directly or upload a .txt / .md file.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items.map((item: any) => item.str || '');
    fullText += `--- Page ${pageNum} ---\n` + pageStrings.join(' ') + '\n\n';

    if (onProgress) {
      onProgress({
        currentPage: pageNum,
        totalPages: numPages,
        percentage: Math.round((pageNum / numPages) * 100),
      });
    }
  }

  return fullText.trim();
}

export async function extractTextFromFile(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<{ text: string; fileName: string; inferredSubject: string }> {
  const fileName = file.name;
  const extension = fileName.split('.').pop()?.toLowerCase();

  let inferredSubject = 'General';
  const lowerName = fileName.toLowerCase();
  if (lowerName.includes('bio') || lowerName.includes('cell') || lowerName.includes('genetics')) inferredSubject = 'Biology';
  else if (lowerName.includes('chem') || lowerName.includes('organic') || lowerName.includes('atom')) inferredSubject = 'Chemistry';
  else if (lowerName.includes('cs') || lowerName.includes('algorithm') || lowerName.includes('code') || lowerName.includes('data')) inferredSubject = 'Computer Science';
  else if (lowerName.includes('math') || lowerName.includes('calculus') || lowerName.includes('algebra')) inferredSubject = 'Mathematics';
  else if (lowerName.includes('physic') || lowerName.includes('mechanic') || lowerName.includes('quantum')) inferredSubject = 'Physics';
  else if (lowerName.includes('econ') || lowerName.includes('finance') || lowerName.includes('market')) inferredSubject = 'Economics';
  else if (lowerName.includes('hist') || lowerName.includes('war') || lowerName.includes('century')) inferredSubject = 'History';

  if (extension === 'pdf') {
    const text = await extractTextFromPDF(file, onProgress);
    return { text, fileName, inferredSubject };
  } else if (['txt', 'md', 'json', 'csv', 'ts', 'js', 'py'].includes(extension || '')) {
    const text = await file.text();
    return { text, fileName, inferredSubject };
  } else {
    // Attempt plain text read as fallback
    try {
      const text = await file.text();
      return { text, fileName, inferredSubject };
    } catch {
      throw new Error(`Unsupported file type: .${extension}. Please upload a .pdf, .txt, or .md file.`);
    }
  }
}
