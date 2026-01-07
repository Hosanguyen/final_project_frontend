import { useEffect } from 'react';

const SITE_NAME = 'CodeLearn';

/**
 * Custom hook để đặt title cho trang
 * @param {string} title - Title của trang (không bao gồm tên website)
 * @param {boolean} appendSiteName - Có thêm tên website vào title không (mặc định: true)
 */
const useDocumentTitle = (title, appendSiteName = true) => {
    useEffect(() => {
        const previousTitle = document.title;
        
        if (title) {
            document.title = appendSiteName ? `${title} | ${SITE_NAME}` : title;
        } else {
            document.title = SITE_NAME;
        }
        
        // Cleanup: khôi phục title cũ khi unmount
        return () => {
            document.title = previousTitle;
        };
    }, [title, appendSiteName]);
};

export default useDocumentTitle;
export { SITE_NAME };
