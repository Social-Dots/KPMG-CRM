


export function createPageUrl(pageName: string) {
    // Keep the original case for the page name to match route definitions
    return '/' + pageName.replace(/ /g, '-');
}