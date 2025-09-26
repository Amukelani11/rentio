const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupChatStorage() {
  try {
    console.log('Setting up chat attachments storage bucket...')

    // Create the storage bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('chat-attachments', {
      public: true,
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ],
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      cors: {
        origins: ['*'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        headers: ['*']
      }
    })

    if (bucketError) {
      // Bucket might already exist
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Chat attachments bucket already exists')
      } else {
        console.error('❌ Failed to create bucket:', bucketError)
        return
      }
    } else {
      console.log('✅ Chat attachments bucket created successfully')
    }

    // Set up RLS policies for the bucket
    console.log('Setting up storage policies...')

    // Create policy to allow authenticated users to upload files to their conversation folders
    const { error: uploadPolicyError } = await supabase.rpc('create_chat_upload_policy')

    if (uploadPolicyError) {
      console.log('Note: Could not create upload policy via RPC (may not exist yet)')
      console.log('Manual policy setup may be required in Supabase dashboard')
    }

    console.log('✅ Chat storage setup completed!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Set up Row Level Security (RLS) policies in Supabase dashboard')
    console.log('2. Create a policy allowing users to upload to chat-attachments bucket')
    console.log('3. Ensure conversation participants can access files in their conversation folders')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

setupChatStorage()
