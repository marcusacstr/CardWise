import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get partner record
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner record not found' }, { status: 404 })
    }

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get('logo') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.' 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Please upload an image smaller than 5MB.' 
      }, { status: 400 })
    }

    // Create unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `partner-${partner.id}-${Date.now()}.${fileExtension}`
    
    let logoUrl: string

    // Check if we're in production (Vercel) or development
    const isProduction = process.env.NODE_ENV === 'production' && process.env.VERCEL

    if (isProduction) {
      // Production: Use Supabase Storage
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('partner-logos')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true
          })

        if (uploadError) {
          console.error('Supabase storage error:', uploadError)
          return NextResponse.json({ 
            error: 'Failed to upload to storage: ' + uploadError.message 
          }, { status: 500 })
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('partner-logos')
          .getPublicUrl(fileName)

        logoUrl = publicUrl
      } catch (storageError) {
        console.error('Storage upload failed:', storageError)
        return NextResponse.json({ 
          error: 'Storage upload failed' 
        }, { status: 500 })
      }
    } else {
      // Development: Use local file system
      try {
        // Create upload directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos')
        try {
          await mkdir(uploadDir, { recursive: true })
        } catch (error) {
          // Directory might already exist, continue
        }

        // Save file to public directory
        const filePath = path.join(uploadDir, fileName)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Create public URL
        logoUrl = `/uploads/logos/${fileName}`
      } catch (fsError) {
        console.error('File system error:', fsError)
        return NextResponse.json({ 
          error: 'Failed to save file locally' 
        }, { status: 500 })
      }
    }

    // Update partner record with new logo URL
    const { data: updatedPartner, error: updateError } = await supabase
      .from('partners')
      .update({ 
        logo_url: logoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', partner.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update partner logo: ' + updateError.message 
      }, { status: 500 })
    }

    // Also update any existing portal configs
    await supabase
      .from('partner_portal_configs')
      .update({ 
        logo_url: logoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('partner_id', partner.id)

    return NextResponse.json({
      success: true,
      logoUrl: logoUrl,
      message: 'Logo uploaded successfully!',
      environment: isProduction ? 'production' : 'development'
    })

  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 