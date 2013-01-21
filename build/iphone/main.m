//
//  Appcelerator Titanium Mobile
//  WARNING: this is a generated file and should not be modified
//

#import <UIKit/UIKit.h>
#define _QUOTEME(x) #x
#define STRING(x) _QUOTEME(x)

NSString * const TI_APPLICATION_DEPLOYTYPE = @"production";
NSString * const TI_APPLICATION_ID = @"com.sinequanonsolutions.relaymgr";
NSString * const TI_APPLICATION_PUBLISHER = @"SineQuaNon Solutions";
NSString * const TI_APPLICATION_URL = @"http://sinequanonsolutions.com";
NSString * const TI_APPLICATION_NAME = @"RelayMgr";
NSString * const TI_APPLICATION_VERSION = @"2.6";
NSString * const TI_APPLICATION_DESCRIPTION = @"Application for managing 36 leg relays";
NSString * const TI_APPLICATION_COPYRIGHT = @"2010 by SineQuaNon Solutions";
NSString * const TI_APPLICATION_GUID = @"f2512192-2a41-4873-a576-5077dfc240c5";
BOOL const TI_APPLICATION_ANALYTICS = true;

#ifdef TARGET_IPHONE_SIMULATOR
NSString * const TI_APPLICATION_RESOURCE_DIR = @"";
#endif

int main(int argc, char *argv[]) {
    NSAutoreleasePool * pool = [[NSAutoreleasePool alloc] init];

#ifdef __LOG__ID__
	NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
	NSString *documentsDirectory = [paths objectAtIndex:0];
	NSString *logPath = [documentsDirectory stringByAppendingPathComponent:[NSString stringWithFormat:@"%s.log",STRING(__LOG__ID__)]];
	freopen([logPath cStringUsingEncoding:NSUTF8StringEncoding],"w+",stderr);
	fprintf(stderr,"[INFO] Application started\n");
#endif

	int retVal = UIApplicationMain(argc, argv, nil, @"TiApp");
    [pool release];
    return retVal;
}
