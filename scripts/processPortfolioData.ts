/**
 * Portfolio Data Processing Script
 * Purpose: Process and upload portfolio data to Supabase vector database
 * Usage: npm run process-data
 * 
 * This script:
 * 1. Validates portfolio data format
 * 2. Processes data into optimized chunks
 * 3. Generates embeddings for each chunk
 * 4. Uploads to Supabase vector database
 * 5. Provides processing statistics
 */

import { processLabeledDocument, validateDocumentFormat } from '../src/lib/documentProcessor';
import { storeChunks, clearCategory, getVectorStats } from '../src/lib/vectorstore';
import { PORTFOLIO_DATA, validatePortfolioData } from '../src/data/portfolio';

async function main() {
  console.log('🚀 Starting portfolio data processing...\n');
  
  try {
    // Step 1: Validate portfolio data
    console.log('📋 Validating portfolio data...');
    const dataValidation = validatePortfolioData();
    
    if (!dataValidation.isValid) {
      console.error('❌ Portfolio data validation failed:');
      dataValidation.errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }
    
    console.log('✅ Portfolio data validation passed');
    
    // Step 2: Validate document format
    console.log('\n📝 Validating document format...');
    const formatValidation = validateDocumentFormat(dataValidation.cleanedData);
    
    if (!formatValidation.isValid) {
      console.error('❌ Document format validation failed:');
      formatValidation.errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }
    
    console.log('✅ Document format validation passed');
    
    // Step 3: Get initial database stats
    console.log('\n📊 Getting initial database statistics...');
    const initialStats = await getVectorStats();
    console.log(`Current database: ${initialStats.totalChunks} chunks, ${initialStats.totalTokens} tokens`);
    
    // Step 4: Process document into chunks
    console.log('\n⚙️ Processing document into optimized chunks...');
    const processingResult = await processLabeledDocument(dataValidation.cleanedData, {
      maxChunkSize: 300,
      chunkOverlap: 50,
      minChunkSize: 50,
      prioritySections: ['BIO', 'CONTACT', 'SKILLS'],
      sourceFile: 'portfolio_data_v1'
    });
    
    console.log(`✅ Processing complete: ${processingResult.totalChunks} chunks created`);
    console.log(`📈 Total tokens: ${processingResult.totalTokens}`);
    console.log('📂 Category distribution:');
    Object.entries(processingResult.categoryDistribution).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count} chunks`);
    });
    
    if (processingResult.processingErrors.length > 0) {
      console.warn('\n⚠️ Processing warnings:');
      processingResult.processingErrors.forEach(error => console.warn(`  - ${error}`));
    }
    
    // Step 5: Clear existing data (optional - prompt user)
    const shouldClearExisting = process.argv.includes('--clear') || 
      process.argv.includes('--force-replace');
    
    if (shouldClearExisting && initialStats.totalChunks > 0) {
      console.log('\n🗑️ Clearing existing data...');
      const categories = Object.keys(processingResult.categoryDistribution);
      
      for (const category of categories) {
        const cleared = await clearCategory(category);
        console.log(`  Cleared ${cleared} chunks from ${category}`);
      }
    }
    
    // Step 6: Store chunks in vector database
    console.log('\n💾 Storing chunks in vector database...');
    const storedCount = await storeChunks(processingResult.chunks);
    
    console.log(`✅ Storage complete: ${storedCount}/${processingResult.totalChunks} chunks stored`);
    
    // Step 7: Get final statistics
    console.log('\n📊 Getting final database statistics...');
    const finalStats = await getVectorStats();
    console.log(`Final database: ${finalStats.totalChunks} chunks, ${finalStats.totalTokens} tokens`);
    console.log('📂 Final category distribution:');
    Object.entries(finalStats.categoryCounts).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count} chunks`);
    });
    
    // Step 8: Success summary
    console.log('\n🎉 Portfolio data processing completed successfully!');
    console.log(`\n📈 Summary:`);
    console.log(`  - Processed: ${processingResult.totalChunks} chunks`);
    console.log(`  - Stored: ${storedCount} chunks`);
    console.log(`  - Total tokens: ${processingResult.totalTokens}`);
    console.log(`  - Categories: ${Object.keys(processingResult.categoryDistribution).length}`);
    console.log(`  - Success rate: ${((storedCount / processingResult.totalChunks) * 100).toFixed(1)}%`);
    
    console.log(`\n🤖 Your RAG chatbot is now ready with updated portfolio data!`);
    console.log(`💡 Test it by asking questions about Marvin's background, skills, or projects.`);
    
  } catch (error) {
    console.error('\n❌ Processing failed:', error);
    process.exit(1);
  }
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Portfolio Data Processing Script

Usage: npm run process-data [options]

Options:
  --clear, --force-replace    Clear existing data before uploading new data
  --help, -h                  Show this help message

Examples:
  npm run process-data                    # Process and add to existing data
  npm run process-data --clear           # Clear existing data and replace
  
Note: Make sure your .env file is configured with Supabase and Gemini credentials.
    `);
    process.exit(0);
  }
  
  main().catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}