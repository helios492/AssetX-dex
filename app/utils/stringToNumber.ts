const stringToNumber = (str: string): number => {
    return parseFloat(str.replace(/,/g, ''));
  };

export default stringToNumber