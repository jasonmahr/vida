//
//  ListViewController.swift
//  Vida
//
//  Created by Ryoya Ogishima on 11/13/16.
//  Copyright © 2016 YHack16. All rights reserved.
//

import UIKit

class ListViewController: UIViewController {
    
    var tmp: [String] = []
    @IBOutlet weak var name: UILabel!
    @IBOutlet weak var address: UILabel!
    @IBOutlet weak var rating: UILabel!
    @IBOutlet weak var male: UILabel!
    @IBOutlet weak var female: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        self.view.backgroundColor = UIColor.white
        name.text = ""
        address.text = ""
        rating.text = ""
        male.text = ""
        female.text = ""
        
        getAsync()
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func getAsync() {
        
        // create the url-request
        let urlString = "https://vida.herokuapp.com/api/clubs"
        let request = NSMutableURLRequest(url: NSURL(string: urlString)! as URL)
        
        // set the method(HTTP-GET)
        request.httpMethod = "GET"
        
        // use NSURLSessionDataTask
        let task = URLSession.shared.dataTask(with: request as URLRequest, completionHandler: { data, response, error in
            if (error == nil) {
                let result = NSString(data: data!, encoding: String.Encoding.utf8.rawValue)!
                print(result)
                var json = JSON(data: data!)
                print(json["info"])
                let tmp2: String = json["info"]
                tmp += tmp2
            } else {
                print(error as Any)
            }
        })
        task.resume()
    }
    func get_a_club(num: Int){
    }
}
