import React, { useState, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { ChecklistStateType } from './types';
import { Checklist } from './components/Checklist';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { PlusIcon } from './components/icons/PlusIcon';

const createNewChecklist = (): ChecklistStateType => ({
  id: Date.now(),
  title: 'TITLE',
  checklistType: '',
  context: '',
  items: [],
  createdBy: '',
  completedBy: '',
});

const App: React.FC = () => {
  const [checklists, setChecklists] = useState<ChecklistStateType[]>([createNewChecklist()]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  
  const printableRef = useRef<HTMLDivElement>(null);

  const addChecklist = useCallback(() => {
    if (checklists.length < 3) {
      setChecklists(prev => [...prev, createNewChecklist()]);
    }
  }, [checklists.length]);

  const removeChecklist = useCallback((id: number) => {
    if (checklists.length > 1) {
      setChecklists(prev => prev.filter(c => c.id !== id));
    }
  }, [checklists.length]);

  const updateChecklist = useCallback((id: number, updatedData: Partial<ChecklistStateType>) => {
    setChecklists(prev => 
      prev.map(c => c.id === id ? { ...c, ...updatedData } : c)
    );
  }, []);

  const handlePrint = () => {
    window.print();
  };
  
  const handleSaveAsPdf = async () => {
    const elementToCapture = printableRef.current;
    if (!elementToCapture || isGeneratingPdf) return;

    setIsGeneratingPdf(true);
    document.body.classList.add('pdf-generating');
    
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      window.scrollTo(0, 0);

      const isLandscape = checklists.length > 1;
      const orientation = isLandscape ? 'l' : 'p';
      
      const canvas = await html2canvas(elementToCapture, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add a 10mm margin
      const margin = 10;
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = pdfHeight - (margin * 2);
      
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

      const fileName = checklists[0]?.title.replace(/\s+/g, '_').toLowerCase() || 'checklist';
      pdf.save(`${fileName}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Sorry, there was an error generating the PDF.");
    } finally {
      document.body.classList.remove('pdf-generating');
      setIsGeneratingPdf(false);
    }
  };

  const isLandscape = checklists.length > 1;

  return (
    <div className="bg-gray-100 min-h-screen w-full flex flex-col items-center p-4 sm:p-6 lg:p-8">
       <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
        
        <header className="w-full max-w-3xl bg-white rounded-xl shadow-md p-4 mb-8 no-print">
          <h1 className="text-center text-lg font-bold text-gray-800 mb-3">Page Layout</h1>
          <div className="flex justify-center items-center gap-4">
            <button 
              onClick={addChecklist} 
              disabled={checklists.length >= 3} 
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PlusIcon />
              <span>Add Checklist</span>
            </button>
            <p className="text-sm text-gray-600 font-medium w-28">{checklists.length} / 3 Checklists</p>
          </div>
        </header>

        <main 
            id="printable-area"
            ref={printableRef}
            className={`a4-page ${isLandscape ? 'a4-landscape' : 'a4-portrait'}`}
        >
          <div className={`h-full w-full flex multi-checklist-container ${isLandscape ? 'scaled-content' : ''}`}>
            {checklists.map((checklist) => (
              <Checklist
                key={checklist.id}
                checklist={checklist}
                onUpdate={updateChecklist}
                onRemove={removeChecklist}
                canRemove={checklists.length > 1}
              />
            ))}
          </div>
        </main>
        
        <div className="mt-8 text-center no-print">
          <div className="flex justify-center gap-4">
            <button
              onClick={handlePrint}
              className="bg-gray-700 text-white px-6 py-3 text-base rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-600 transition-all duration-200 transform hover:scale-105"
            >
              Print
            </button>
            <button
              onClick={handleSaveAsPdf}
              disabled={isGeneratingPdf}
              className="bg-blue-600 text-white px-6 py-3 text-base rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:scale-100 disabled:cursor-wait"
            >
              {isGeneratingPdf ? (
                <>
                  <SpinnerIcon />
                  <span>Saving...</span>
                </>
              ) : (
                'Save as PDF'
              )}
            </button>
          </div>
        </div>
      </div>
       <footer className="text-center mt-12 text-gray-500 text-sm no-print">
        <p>Simple checklist template from the book <em>The Checklist Manifesto</em></p>
      </footer>
    </div>
  );
};

export default App;