import { NextResponse } from 'next/server';
export function failure(error:unknown) {
 const message=error instanceof Error?error.message:'Có lỗi xảy ra';
 const status=message.includes('đăng nhập')?401:message.includes('không được cấp quyền')?403:400;
 return NextResponse.json({error:message},{status});
}
