import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { UserProfile, HotelRequest, HotelOffering } from '@/types';
import type { Workspace } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceData {
  requests: HotelRequest[];
  workspace: Workspace;
  adminProfile: UserProfile;
  offerings?: HotelOffering[];
}

const generateInvoiceNumber = (workspace: Workspace): string => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear().toString().slice(-2);
  
  // Get workspace code (first 3 characters or use full name if shorter)
  const workspaceCode = workspace.name.substring(0, 3).toUpperCase();
  
  // For now, use timestamp as sequential number
  // In production, this should be fetched from database
  const sequential = Date.now().toString().slice(-6);
  
  return `INV-${workspaceCode}-${day}${month}${year}-${sequential}`;
};

const createInvoiceHTML = (data: InvoiceData, invoiceNumber: string): string => {
  const { requests, workspace, adminProfile } = data;
  
  // Calculate totals - for now using a base amount per request
  // In production, this should use actual accepted offering amounts
  let grandTotal = 0;
  const invoiceItems = requests.map(request => {
    const total = 1000; // Placeholder amount
    grandTotal += total;
    
    return {
      ...request,
      total
    };
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <img src="/lovable-uploads/8cfa4a00-bda0-48f3-9145-21434c9c3a5b.png" style="height: 50px; width: auto;" alt="SAKINA Logo" />
          <div>
            <h1 style="color: #1e293b; font-size: 28px; margin: 0; font-weight: bold;">SAKINA</h1>
            <p style="color: #64748b; margin: 0; font-size: 14px;">Travel Management System</p>
          </div>
        </div>
        <div style="text-align: right;">
          <h2 style="color: #dc2626; font-size: 24px; margin: 0;">INVOICE</h2>
          <p style="color: #64748b; margin: 5px 0; font-size: 14px;">${invoiceNumber}</p>
          <p style="color: #64748b; margin: 0; font-size: 14px;">Date: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <!-- Company & Client Info -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
        <div>
          <h3 style="color: #1e293b; font-size: 16px; margin-bottom: 10px; font-weight: bold;">From:</h3>
          <div style="color: #64748b; line-height: 1.6;">
            <p style="margin: 0; font-weight: bold; color: #1e293b;">${adminProfile.full_name || 'SAKINA Admin'}</p>
            <p style="margin: 0;">${adminProfile.email}</p>
            ${adminProfile.phone ? `<p style="margin: 0;">${adminProfile.phone}</p>` : ''}
          </div>
        </div>
        <div>
          <h3 style="color: #1e293b; font-size: 16px; margin-bottom: 10px; font-weight: bold;">To:</h3>
          <div style="color: #64748b; line-height: 1.6;">
            <p style="margin: 0; font-weight: bold; color: #1e293b;">${workspace.name}</p>
            ${workspace.description ? `<p style="margin: 0;">${workspace.description}</p>` : ''}
          </div>
        </div>
      </div>

      <!-- Invoice Items -->
      <div style="margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 12px; text-align: left; color: #1e293b; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Request</th>
              <th style="padding: 12px; text-align: left; color: #1e293b; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Details</th>
              <th style="padding: 12px; text-align: left; color: #1e293b; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Hotel</th>
              <th style="padding: 12px; text-align: right; color: #1e293b; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceItems.map(item => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px; color: #1e293b;">
                  <div style="font-weight: bold;">REQ-${item.id.slice(-6)}</div>
                  <div style="font-size: 12px; color: #64748b;">${item.travelName}</div>
                </td>
                <td style="padding: 12px; color: #64748b; font-size: 14px;">
                  <div>${item.city}</div>
                  <div>${item.checkIn} to ${item.checkOut}</div>
                  <div>${item.paxCount} PAX</div>
                </td>
                <td style="padding: 12px; color: #64748b; font-size: 14px;">
                  Tour Leader: ${item.tlName}
                </td>
                <td style="padding: 12px; text-align: right; color: #1e293b; font-weight: bold; font-size: 16px;">
                  $${item.total.toFixed(2)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Total -->
      <div style="text-align: right; margin-bottom: 30px;">
        <div style="display: inline-block; background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 2px solid #e2e8f0;">
          <div style="color: #64748b; margin-bottom: 5px;">Total Amount:</div>
          <div style="color: #1e293b; font-size: 24px; font-weight: bold;">$${grandTotal.toFixed(2)}</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
        <p style="margin: 0;">Thank you for your business!</p>
        <p style="margin: 5px 0 0 0;">Generated by SAKINA Travel Management System</p>
      </div>
    </div>
  `;
};

export const generateInvoicePDF = async (data: InvoiceData): Promise<any> => {
  const { requests, workspace, adminProfile, offerings = [] } = data;
  
  const invoiceNumber = generateInvoiceNumber(workspace);
  
  // Calculate total amount from confirmed offerings
  let totalAmount = 0;
  requests.forEach(request => {
    const offering = offerings.find(o => o.request_id === request.id && o.status === 'CONFIRMED');
    if (offering) {
      // Sum all room type final prices for each confirmed offering
      const offeringTotal = (offering.final_price_double || 0) + 
                           (offering.final_price_triple || 0) + 
                           (offering.final_price_quad || 0) + 
                           (offering.final_price_quint || 0);
      totalAmount += offeringTotal;
      console.log(`Request ${request.id.slice(-6)}: Offering total = $${offeringTotal}`);
    } else {
      console.log(`Request ${request.id.slice(-6)}: No confirmed offering found`);
    }
  });
  
  console.log(`Invoice total calculation: $${totalAmount} for ${requests.length} requests`);

  // Save invoice to database
  const { data: savedInvoice, error: saveError } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      workspace_id: workspace.id,
      admin_id: adminProfile.id,
      request_ids: requests.map(r => r.id),
      total_amount: totalAmount,
      status: 'generated'
    })
    .select()
    .single();

  if (saveError) {
    console.error('Error saving invoice:', saveError);
    throw new Error('Failed to save invoice record');
  }

  const htmlContent = createInvoiceHTML(data, invoiceNumber);
  
  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  document.body.appendChild(container);
  
  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Download the PDF
    pdf.save(`${invoiceNumber}.pdf`);
    
    return savedInvoice;
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};