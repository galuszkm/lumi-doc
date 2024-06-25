import React, {useEffect} from "react";

const useBeforeUnload = () => {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault()
      return "Are you sure you want to leave?"
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])
}

export default useBeforeUnload