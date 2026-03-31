import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const generatePDF = async (fileName = 'Document.pdf') => {
  const element = document.getElementById('quotation-pdf')

  if (!element) {
    alert('PDF element not found')
    return
  }

  // High DPI rendering
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: null
  })

  const imgData = canvas.toDataURL('image/png', 1.0)

  const pdf = new jsPDF('p', 'mm', 'a4')

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0

  // First page
  pdf.addImage(
    imgData,
    'PNG',
    0,
    position,
    imgWidth,
    imgHeight,
    undefined,
    'FAST'
  )

  heightLeft -= pageHeight

  // Additional pages
  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(
      imgData,
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    )
    heightLeft -= pageHeight
  }
  pdf.save(fileName);
}